import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { assertTransition } from "@/lib/order-state-machine";
import { decideWebhookAction } from "@/lib/webhooks";
import { decideRiskHold, type RiskCheckOutcome } from "@/lib/risk-decision";
import {
  checkFulfilmentCircuitBreakers,
  checkLowBalanceCircuitBreaker,
} from "@/lib/admin/circuit-breakers";
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

  const fulfillment = getFulfillmentProvider();

  // Risk check happens here — after payment, before any supplier call —
  // per the storefront owner's explicit instruction (2026-08-26): the
  // score decides whether this order goes to `held` instead of
  // fulfilling. The hold/proceed decision itself is decideRiskHold() —
  // src/lib/risk-decision.ts — a pure function with its own test
  // coverage for the fail-closed case, same reasoning as
  // decideWebhookAction above. A held order can always be resolved by
  // hand later (src/app/admin/orders); a fraudulent order that shipped a
  // key because a fraud check happened to time out cannot be undone.
  let riskOutcome: RiskCheckOutcome;
  try {
    const risk = await fulfillment.assessRisk({
      orderId: paidOrder.id,
      customerEmail: paidOrder.customerEmail,
      customerIpAddress: paidOrder.customerIpAddress ?? "unknown",
      customerUserAgent: paidOrder.customerUserAgent ?? undefined,
      // customerPaymentEmail: not sent yet — Mollie is still a stub with
      // no real payer identity to report. See RiskAssessmentInput's own
      // comment in src/lib/fulfillment/types.ts.
    });
    riskOutcome = {
      ok: true,
      riskScore: risk.riskScore,
      suggestedHoldThreshold: risk.suggestedHoldThreshold,
    };
    await logEvent({
      orderId: paidOrder.id,
      eventType: "order.risk_assessed",
      payload: {
        riskScore: risk.riskScore,
        suggestedHoldThreshold: risk.suggestedHoldThreshold,
        held: risk.riskScore >= risk.suggestedHoldThreshold,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    riskOutcome = { ok: false, error: message };
    await logEvent({
      orderId: paidOrder.id,
      eventType: "order.risk_check_failed",
      payload: { message },
    });
  }

  const riskDecision = decideRiskHold(riskOutcome);

  if (riskDecision.held) {
    assertTransition(OrderStatus.paid, OrderStatus.held);
    await prisma.order.update({
      where: { id: paidOrder.id },
      data: { status: OrderStatus.held },
    });
    await logEvent({
      orderId: paidOrder.id,
      eventType: "order.held",
      payload: { reason: riskDecision.reason },
    });
    return NextResponse.json({ status: "held" });
  }

  assertTransition(OrderStatus.paid, OrderStatus.fulfilling);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: { status: OrderStatus.fulfilling },
  });

  let anyFailed = false;
  let anyAwaitingCode = false;
  const pendingCodes: { orderItemId: string; codeId: string }[] = [];

  for (const item of paidOrder.items) {
    const result = await fulfillment.orderKey(
      item.product.supplierProductId,
      paidOrder.id
    );

    await logEvent({
      orderId: paidOrder.id,
      eventType:
        result.status === "failed" ? "supplier.order_failed" : "supplier.order_key",
      payload: {
        orderItemId: item.id,
        status: result.status,
        // codeId is an identifier, not a key value — safe to log in the
        // clear, unlike the code it eventually resolves to.
        ...(result.status === "awaiting_code" ? { codeId: result.codeId } : {}),
        // reason/message: needed by the circuit breakers below to tell a
        // network-level failure ("timeout"/"unknown") apart from a real
        // business answer ("out_of_stock"/"empty_balance") — see
        // src/lib/admin/circuit-breakers.ts's lastCallsAllUnreachable().
        ...(result.status === "failed" ? { reason: result.reason, message: result.message } : {}),
      },
    });

    if (result.status === "failed") {
      anyFailed = true;
      // Fire-and-check immediately, not batched until after the loop —
      // PLAN.md's "3 in 5 minutes" is about how fast a bad patch of
      // orders accumulates; waiting until every item in THIS order has
      // been tried first would blunt that for any order with more than
      // one line item.
      await checkFulfilmentCircuitBreakers();
      continue;
    }

    if (result.status === "awaiting_code") {
      anyAwaitingCode = true;
      // Without this, a paid order has no way to know which code to
      // retrieve later — the whole reason this field exists.
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { pendingCodeId: result.codeId },
      });
      pendingCodes.push({ orderItemId: item.id, codeId: result.codeId });
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

  // Balance breaker: once per order's fulfilment pass, regardless of
  // outcome — see checkLowBalanceCircuitBreaker's own comment for why
  // this isn't folded into the per-item failure check above.
  await checkLowBalanceCircuitBreaker();

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
      payload: { pendingCodes },
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
