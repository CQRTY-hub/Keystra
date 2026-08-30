import { describe, expect, it } from "vitest";
import { decideFulfilmentBreakers } from "@/lib/admin/circuit-breakers";

/**
 * Storefront owner, 2026-08-27: "de automatische circuit breakers ... in
 * de webhook zelf." This pins down the pure trip logic — PLAN.md's four
 * rules minus the balance rule, which lives outside this function (see
 * checkLowBalanceCircuitBreaker in src/lib/admin/circuit-breakers.ts).
 */
describe("decideFulfilmentBreakers", () => {
  it("trips nothing when everything is healthy", () => {
    expect(
      decideFulfilmentBreakers({
        failuresIn5Min: 0,
        failuresInHour: 0,
        lastCallsAllUnreachable: false,
      })
    ).toEqual([]);
  });

  it("trips the consecutive-failure breaker at the 3-in-5-minutes threshold", () => {
    const below = decideFulfilmentBreakers({
      failuresIn5Min: 2,
      failuresInHour: 2,
      lastCallsAllUnreachable: false,
    });
    expect(below).toEqual([]);

    const atThreshold = decideFulfilmentBreakers({
      failuresIn5Min: 3,
      failuresInHour: 3,
      lastCallsAllUnreachable: false,
    });
    expect(atThreshold.map((t) => t.id)).toContain("consecutive_fulfilment_failures");
  });

  it("trips the hourly breaker at the 5-in-an-hour threshold, independent of the 5-minute count", () => {
    const triggers = decideFulfilmentBreakers({
      failuresIn5Min: 1,
      failuresInHour: 5,
      lastCallsAllUnreachable: false,
    });
    expect(triggers).toEqual([
      { id: "fulfilment_failures_hourly", detail: expect.stringContaining("5") },
    ]);
  });

  it("trips the supplier-unreachable breaker when the last calls were all timeouts/unknown errors", () => {
    const triggers = decideFulfilmentBreakers({
      failuresIn5Min: 0,
      failuresInHour: 0,
      lastCallsAllUnreachable: true,
    });
    expect(triggers).toEqual([
      { id: "supplier_unreachable", detail: expect.any(String) },
    ]);
  });

  it("can trip more than one breaker at once", () => {
    const triggers = decideFulfilmentBreakers({
      failuresIn5Min: 3,
      failuresInHour: 5,
      lastCallsAllUnreachable: true,
    });
    const ids = triggers.map((t) => t.id);
    expect(ids).toContain("consecutive_fulfilment_failures");
    expect(ids).toContain("fulfilment_failures_hourly");
    expect(ids).toContain("supplier_unreachable");
    expect(triggers).toHaveLength(3);
  });
});
