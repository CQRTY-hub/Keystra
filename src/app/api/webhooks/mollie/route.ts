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
import { getPaymentProvider, type PaymentStatus } from "@/lib/payments";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getEmailProvider } from "@/lib/email";
import { issueInvoiceForOrder } from "@/lib/invoicing";

/**
 * Mollie webhooks arrive as `application/x-www-form-urlencoded` with a
 * single `id` field — the payment ID. This fetches the payment from
 * Mollie's own API (getPaymentProvider().getPayment(), which either the
 * mock or real Mollie implements — see src/lib/payments) to find its
 * real status; the webhook body itself is never trusted on its own, and
 * Mollie doesn't sign it (see mollie-provider.ts's header comment for
 * why re-fetching is the standard approach, not a workaround).
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

  // Never trust the webhook body's own claimed status (there isn't one —
  // Mollie only ever sends the id) — re-fetch from Mollie's API with our
  // own key. A fetch failure here (including "no such payment") means
  // this webhook doesn't check out against Mollie's own records, which is
  // a 400, not something to guess about.
  let payment: { status: PaymentStatus; payerEmail?: string };
  try {
    payment = await getPaymentProvider().getPayment(molliePaymentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logEvent({
      eventType: "payment.webhook_invalid",
      payload: { molliePaymentId, message },
    });
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

  // decideWebhookAction only answers "is this order still pending" — it
  // has no opinion on what Mollie's status actually is. That branch lives
  // here: Mollie's webhook fires for paid, authorized, failed, expired,
  // and canceled (see mollie-provider.ts) — only "paid" means proceed.
  // Everything else leaves the order `pending`, on purpose: nothing was
  // charged, the shopper's cart is still intact (CheckoutForm.tsx never
  // clears it until a confirmed payment), and "Try again" on the
  // payment-failed / confirmation page re-enters checkout cleanly. See
  // that page's own comment for the full reasoning — this used to be
  // true only for the mock's cancel button; it's now true for a real
  // declined card or an abandoned/expired attempt too.
  if (payment.status !== "paid") {
    await logEvent({
      orderId: paidOrder.id,
      eventType: nonPaidEventType(payment.status),
      payload: { molliePaymentId, status: payment.status },
    });
    return NextResponse.json({ status: payment.status });
  }

  assertTransition(paidOrder.status, OrderStatus.paid);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: {
      status: OrderStatus.paid,
      // Only ever set from a *paid* payment's own reported detail —
      // never from what the shopper typed at checkout (that's
      // customerEmail, captured separately at order creation). Absent
      // for most methods; see mollie-provider.ts's extractPayerEmail.
      customerPaymentEmail: payment.payerEmail,
    },
  });
  await logEvent({
    orderId: paidOrder.id,
    eventType: "payment.confirmed",
    payload: { molliePaymentId, payerEmail: payment.payerEmail },
  });

  // Number + PDF assigned now, at payment confirmation — see
  // src/lib/invoicing/index.ts's own comment for why this can't wait
  // until fulfilment succeeds. Wrapped, deliberately: the order is
  // already `paid` at this point, so an uncaught throw here would 500
  // this whole request — and a Mollie retry of the same webhook would
  // then find the order no longer `pending` and be ignored as a
  // duplicate (decideWebhookAction), silently skipping fulfilment
  // forever. An invoicing failure must never cost the customer their
  // key; it only gets logged.
  try {
    await issueInvoiceForOrder(paidOrder.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logEvent({
      orderId: paidOrder.id,
      eventType: "invoice.failed",
      payload: { message },
    });
  }

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
      // The address Mollie actually charged, when it reported one (see
      // mollie-provider.ts) — a mismatch with customerEmail above is
      // exactly the fraud signal this field exists for (storefront
      // owner's own framing, 2026-08-26).
      customerPaymentEmail: payment.payerEmail,
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
        // Surfaced for the admin order page (PLAN.md: "the strongest
        // fraud signal we have") — a mismatch here doesn't affect
        // riskScore itself (that's entirely CodesWholesale's call from
        // the fields it was sent), it's shown so a human reviewing a
        // held order sees it at a glance instead of decoding raw JSON.
        customerPaymentEmail: payment.payerEmail,
        paymentEmailMismatch: Boolean(
          payment.payerEmail &&
            payment.payerEmail.toLowerCase() !== paidOrder.customerEmail.toLowerCase()
        ),
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
      // Not yet — the invoice already exists (issued above, at payment
      // confirmation), but it goes out with the completion email, once
      // there's actually a key alongside it. See issueInvoiceForOrder's
      // own comment.
      includesInvoice: false,
    });

    return NextResponse.json({ status: "awaiting_code" });
  }

  assertTransition(OrderStatus.fulfilling, OrderStatus.completed);
  await prisma.order.update({
    where: { id: paidOrder.id },
    data: { status: OrderStatus.completed },
  });

  // "na bevestiging van betaling en ontvangen van de key" — this is that
  // moment. The invoice itself was already generated at payment
  // confirmation above; this only decides whether to flag it on the
  // email that's actually going out now, alongside the key.
  const invoice = await prisma.invoice.findUnique({ where: { orderId: paidOrder.id } });

  const email = getEmailProvider();
  await email.send({
    to: paidOrder.customerEmail,
    template: "order_confirmation",
    orderId: paidOrder.id,
    includesKey: true,
    includesInvoice: invoice !== null,
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

/**
 * EventType (src/lib/event-log.ts) is a fixed literal union, deliberately
 * not a free-form string — every write is a conscious, typed choice. This
 * maps every non-"paid" status Mollie's webhook can report to one of
 * those literals; "open"/"pending"/"unknown" aren't in Mollie's own list
 * of statuses that trigger a webhook call at all (see mollie-provider.ts),
 * so they fall through to the shared catch-all rather than each getting
 * their own EventType that should never actually occur.
 */
function nonPaidEventType(
  status: Exclude<PaymentStatus, "paid">
): "payment.authorized" | "payment.failed" | "payment.expired" | "payment.canceled" | "payment.status_unhandled" {
  switch (status) {
    case "authorized":
      return "payment.authorized";
    case "failed":
      return "payment.failed";
    case "expired":
      return "payment.expired";
    case "canceled":
      return "payment.canceled";
    default:
      return "payment.status_unhandled";
  }
}
