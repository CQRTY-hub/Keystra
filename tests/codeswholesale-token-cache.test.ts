import { describe, expect, it } from "vitest";
import { isTokenStillValid } from "@/lib/fulfillment/codeswholesale-provider";

/**
 * Covers the pure decision behind CodesWholesaleProvider's token cache
 * (PLAN.md, Phase 0.5: 60-minute token lifetime, reuse until actually
 * expired — never fetch a token per request). The real HTTP calls this
 * cache wraps are still TODOs; this only tests the "is the cached token
 * still good" decision, which needs no network and no real clock.
 */
describe("isTokenStillValid", () => {
  const now = 1_000_000;

  it("is valid well before expiry", () => {
    const expiresAt = now + 60 * 60_000; // expires in 60 minutes
    expect(isTokenStillValid(expiresAt, now)).toBe(true);
  });

  it("is invalid once past expiry", () => {
    const expiresAt = now - 1;
    expect(isTokenStillValid(expiresAt, now)).toBe(false);
  });

  it("is invalid inside the safety margin, even though not technically expired yet", () => {
    // Expires in 30 seconds — inside the default 60s safety margin, so a
    // token already in flight shouldn't die mid-request.
    const expiresAt = now + 30_000;
    expect(isTokenStillValid(expiresAt, now)).toBe(false);
  });

  it("respects a custom safety margin", () => {
    const expiresAt = now + 30_000;
    expect(isTokenStillValid(expiresAt, now, 10_000)).toBe(true);
  });

  it("treats exactly-at-the-margin as not valid (strict inequality)", () => {
    const expiresAt = now + 60_000;
    expect(isTokenStillValid(expiresAt, now, 60_000)).toBe(false);
  });
});
