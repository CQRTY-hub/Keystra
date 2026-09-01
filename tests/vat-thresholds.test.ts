import { describe, expect, it } from "vitest";
import {
  computeThresholdStatus,
  TOTAL_THRESHOLD_CENTS,
  FOREIGN_EU_THRESHOLD_CENTS,
} from "@/lib/vat-thresholds";
import { classifyCountry, findCountry, countryDisplayName } from "@/lib/countries";

describe("classifyCountry", () => {
  it("classifies Belgium on its own, not as part of 'other EU'", () => {
    expect(classifyCountry("BE")).toBe("belgium");
  });

  it("classifies another EU member state as other_eu", () => {
    expect(classifyCountry("NL")).toBe("other_eu");
    expect(classifyCountry("FR")).toBe("other_eu");
  });

  it("classifies a non-EU country as non_eu", () => {
    expect(classifyCountry("US")).toBe("non_eu");
    expect(classifyCountry("GB")).toBe("non_eu");
  });

  it("is case-insensitive", () => {
    expect(classifyCountry("be")).toBe("belgium");
    expect(classifyCountry("nl")).toBe("other_eu");
  });

  it("falls back to non_eu for an unrecognised code — the conservative direction for a threshold that exists to catch foreign-EU sales", () => {
    expect(classifyCountry("ZZ")).toBe("non_eu");
    expect(classifyCountry("Some legacy free-text value")).toBe("non_eu");
  });
});

describe("countryDisplayName", () => {
  it("returns the full name for a known code", () => {
    expect(countryDisplayName("BE")).toBe("Belgium");
  });

  it("falls back to the raw value for an unrecognised (legacy free-text) entry", () => {
    expect(countryDisplayName("Kingdom of Nowhere")).toBe("Kingdom of Nowhere");
  });
});

describe("findCountry", () => {
  it("finds a real country regardless of case", () => {
    expect(findCountry("nl")?.name).toBe("Netherlands");
  });

  it("returns undefined for an unknown code", () => {
    expect(findCountry("ZZ")).toBeUndefined();
  });
});

describe("computeThresholdStatus", () => {
  it("reports OK when well under both thresholds", () => {
    const status = computeThresholdStatus(2026, 100_00, 50_00, 20_00);
    expect(status.totalWarning).toBe(false);
    expect(status.totalExceeded).toBe(false);
    expect(status.foreignEuWarning).toBe(false);
    expect(status.foreignEuExceeded).toBe(false);
  });

  it("keeps Belgium out of the foreign-EU figure", () => {
    // All revenue from Belgium: foreignEuCents (= otherEuCents) must be 0
    // even though total turnover is well above zero.
    const status = computeThresholdStatus(2026, 500_00, 0, 0);
    expect(status.foreignEuCents).toBe(0);
    expect(status.totalCents).toBe(500_00);
  });

  it("excludes non-EU revenue from the foreign-EU threshold but includes it in the total", () => {
    const status = computeThresholdStatus(2026, 0, 0, 900_00);
    expect(status.foreignEuCents).toBe(0);
    expect(status.totalCents).toBe(900_00);
  });

  it("warns at 80% of the total threshold, not before", () => {
    const justUnder = computeThresholdStatus(
      2026,
      Math.floor(TOTAL_THRESHOLD_CENTS * 0.79),
      0,
      0
    );
    expect(justUnder.totalWarning).toBe(false);

    const atEighty = computeThresholdStatus(2026, Math.ceil(TOTAL_THRESHOLD_CENTS * 0.8), 0, 0);
    expect(atEighty.totalWarning).toBe(true);
    expect(atEighty.totalExceeded).toBe(false);
  });

  it("marks the total threshold exceeded at exactly the threshold value", () => {
    const status = computeThresholdStatus(2026, TOTAL_THRESHOLD_CENTS, 0, 0);
    expect(status.totalExceeded).toBe(true);
  });

  it("warns and exceeds independently for the foreign-EU threshold", () => {
    const belowWarning = computeThresholdStatus(
      2026,
      0,
      Math.floor(FOREIGN_EU_THRESHOLD_CENTS * 0.5),
      0
    );
    expect(belowWarning.foreignEuWarning).toBe(false);

    const exceeded = computeThresholdStatus(2026, 0, FOREIGN_EU_THRESHOLD_CENTS, 0);
    expect(exceeded.foreignEuWarning).toBe(true);
    expect(exceeded.foreignEuExceeded).toBe(true);
    // Crossing the foreign-EU threshold alone must not silently trip the
    // unrelated total-turnover flag if total is still low.
    expect(exceeded.totalExceeded).toBe(false);
  });
});
