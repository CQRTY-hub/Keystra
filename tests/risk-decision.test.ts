import { describe, expect, it } from "vitest";
import { decideRiskHold } from "@/lib/risk-decision";

/**
 * Storefront owner, 2026-08-26: "Als het endpoint faalt of traag is: fail
 * closed, dus de bestelling gaat naar held in plaats van gewoon
 * doorlopen." The fail-closed case is the one this file exists to pin
 * down — it's easy to accidentally invert in a future edit ("just let it
 * through if the check errors") without a test actively rejecting that.
 */
describe("decideRiskHold", () => {
  it("does not hold a score below the threshold", () => {
    const decision = decideRiskHold({ ok: true, riskScore: 0.4, suggestedHoldThreshold: 1.5 });
    expect(decision).toEqual({ held: false });
  });

  it("holds a score at or above the threshold", () => {
    expect(decideRiskHold({ ok: true, riskScore: 1.5, suggestedHoldThreshold: 1.5 })).toEqual({
      held: true,
      reason: "high_risk_score",
    });
    expect(decideRiskHold({ ok: true, riskScore: 8.5, suggestedHoldThreshold: 1.5 })).toEqual({
      held: true,
      reason: "high_risk_score",
    });
  });

  it("fails CLOSED — an errored check holds the order, never lets it through", () => {
    const decision = decideRiskHold({ ok: false, error: "timeout after 15000ms" });
    expect(decision).toEqual({ held: true, reason: "risk_check_failed" });
  });
});
