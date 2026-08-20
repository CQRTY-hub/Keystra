import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { assertTransition } from "@/lib/order-state-machine";
import { decideWebhookAction } from "@/lib/webhooks";
import { verifyWebhook } from "@/lib/payments/mollie-stub";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getEmailProvider } from "@/lib/email";

/**
 * Mollie webhooks arrive as `application/x-www-form-urlencoded` with a
 * single `id` field — the payment ID. You then fetch the payment from
 * Mollie's API to find its real status; the body itself is never trusted
 * on its own. Phase 1's `verifyWebhook` is a stub that always says valid,
 * since there's no real Mollie account yet — Phase 3 replaces it.
 *
 * Idempotency (PLAN.md non-negotiable #4): the same notification arriving
 * twice must never deliver two keys. See src/lib/webhooks.ts for the pure
 * decision and tests/webhook-idempotency.test.ts for the coverage.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const molliePaymentId = params.get("id") ?? (await tryJsonId(raw));

  if (!molliePaymentId) {
    return NextResponse.json({ message: "Missing payment id" }, { status: 400 });
  }

  await logEvent({
    eventType: "payment.webhook_received",
    payload: { molliePaymentId },
  });

  const { valid } = await verifyWebhook(molliePaymentId);
  if (!valid) {
    return NextResponse.json({ message: "Invalid webhook" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { molliePaymentId },
    include: { items: { include: { product: true } } },
  });

  const decision = decideWebhookAction({
    currentStatus: order?.status ?? null,
  });

  if (decision.action !== "process") {
    await logEvent({
      orderId: order?.id,
      eventType: "payment.webhook_duplicate_ignored",
      payload: { molliePaymentId, decision },
    });
    // Always 200 — Mollie retries on non-2xx, and retrying a decision
    // we've already made correctly just wastes calls.
    return NextResponse.json({ ignored: true, reason: decision.reason });
  }

  // order is guaranteed non-null here: decision is only "process" when an
  // order was found.
  const paidOrder = order!;

  assertTransition(paidOrder.status, OrderStatus.paid);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: { status: OrderStatus.paid },
  });
  await logEvent({
    orderId: paidOrder.id,
    eventType: "payment.confirmed",
    payload: { molliePaymentId },
  });

  assertTransition(OrderStatus.paid, OrderStatus.fulfilling);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: { status: OrderStatus.fulfilling },
  });

  const fulfillment = getFulfillmentProvider();

  let anyFailed = false;
  let anyAwaitingCode = false;

  for (const item of paidOrder.items) {
    const result = await fulfillment.orderKey(
      item.product.supplierProductId,
      paidOrder.id
    );

    await logEvent({
      orderId: paidOrder.id,
      eventType:
        result.status === "failed" ? "supplier.order_failed" : "supplier.order_key",
      payload: { orderItemId: item.id, status: result.status },
    });

    if (result.status === "failed") {
      anyFailed = true;
      continue;
    }

    if (result.status === "awaiting_code") {
      anyAwaitingCode = true;
      continue;
    }

    // Non-negotiable #1: the key is written to the database before it is
    // ever shown or emailed. Nothing reads a key back out until this
    // write has completed.
    if (result.codeType === "CODE_TEXT") {
      await prisma.deliveredKey.create({
        data: {
          orderItemId: item.id,
          value: result.value,
          deliveryMethod: "text",
        },
      });
    } else {
      await prisma.deliveredKey.create({
        data: {
          orderItemId: item.id,
          value: result.valueBase64,
          deliveryMethod: "image",
        },
      });
    }
  }

  if (anyFailed) {
    // Never invent, retry blindly, or substitute a key (non-negotiable
    // #2). The order goes to `held`. Refunding is a real Mollie API call
    // that doesn't exist yet in Phase 1 — TODO(Phase 3): issue the actual
    // refund here once Mollie is live.
    assertTransition(OrderStatus.fulfilling, OrderStatus.held);
    await prisma.order.update({
      where: { id: paidOrder.id },
      data: { status: OrderStatus.held },
    });
    await logEvent({
      orderId: paidOrder.id,
      eventType: "order.held",
      payload: { reason: "fulfilment_failed" },
    });
    return NextResponse.json({ status: "held" });
  }

  if (anyAwaitingCode) {
    assertTransition(OrderStatus.fulfilling, OrderStatus.awaiting_code);
    await prisma.order.update({
      where: { id: paidOrder.id },
      data: { status: OrderStatus.awaiting_code },
    });
    await logEvent({
      orderId: paidOrder.id,
      eventType: "order.awaiting_code",
      payload: {},
    });

    const email = getEmailProvider();
    await email.send({
      to: paidOrder.customerEmail,
      template: "order_awaiting_code",
      orderId: paidOrder.id,
      includesKey: false,
    });

    return NextResponse.json({ status: "awaiting_code" });
  }

  assertTransition(OrderStatus.fulfilling, OrderStatus.completed);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: { status: OrderStatus.completed },
  });

  const email = getEmailProvider();
  await email.send({
    to: paidOrder.customerEmail,
    template: "order_confirmation",
    orderId: paidOrder.id,
    includesKey: true,
  });

  return NextResponse.json({ status: "completed" });
}

async function tryJsonId(raw: string): Promise<string | null> {
  try {
    const json = JSON.parse(raw);
    return typeof json?.id === "string" ? json.id : null;
  } catch {
    return null;
  }
}
