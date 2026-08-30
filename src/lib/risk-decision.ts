/**
 * Pure decision extracted from the webhook route (src/app/api/webhooks/mollie/route.ts)
 * for the same reason src/lib/webhooks.ts's decideWebhookAction exists
 * separately from the route: a fail-closed security decision deserves
 * its own test coverage, not just "the route looks right."
 *
 * Storefront owner, 2026-08-26: "Als het endpoint faalt of traag is: fail
 * closed, dus de bestelling gaat naar held in plaats van gewoon
 * doorlopen." (If the endpoint fails or is slow: fail closed — the order
 * goes to held instead of just proceeding.)
 */

export type RiskCheckOutcome =
  | { ok: true; riskScore: number; suggestedHoldThreshold: number }
  | { ok: false; error: string };

export interface RiskHoldDecision {
  held: boolean;
  reason?: "high_risk_score" | "risk_check_failed";
}

export function decideRiskHold(outcome: RiskCheckOutcome): RiskHoldDecision {
  if (!outcome.ok) {
    // Fail closed: a broken or slow risk check is not a "proceed" signal.
    return { held: true, reason: "risk_check_failed" };
  }
  if (outcome.riskScore >= outcome.suggestedHoldThreshold) {
    return { held: true, reason: "high_risk_score" };
  }
  return { held: false };
}
