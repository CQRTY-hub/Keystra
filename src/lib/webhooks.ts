import { OrderStatus } from "@prisma/client";

/**
 * The idempotency decision for the Mollie webhook, pulled out as a pure
 * function so it's testable without a database (see
 * tests/webhook-idempotency.test.ts) and so the route handler doesn't
 * carry this logic buried inside a bigger function.
 *
 * Rule (PLAN.md non-negotiable #4): the same payment notification
 * arriving twice must never deliver two keys. An order that has already
 * moved past `pending` for a given Mollie payment ID has already been
 * processed — process again only if it's still `pending`.
 */

export interface WebhookDecisionInput {
  /** The order's current status, or null if no matching order was found. */
  currentStatus: OrderStatus | null;
}

export type WebhookDecision =
  | { action: "process" }
  | { action: "ignore_duplicate"; reason: string }
  | { action: "ignore_unknown_order"; reason: string };

export function decideWebhookAction({
  currentStatus,
}: WebhookDecisionInput): WebhookDecision {
  if (currentStatus === null) {
    return {
      action: "ignore_unknown_order",
      reason: "No order matches this payment ID.",
    };
  }

  if (currentStatus !== OrderStatus.pending) {
    return {
      action: "ignore_duplicate",
      reason: `Order is already "${currentStatus}" — payment was already processed.`,
    };
  }

  return { action: "process" };
}
