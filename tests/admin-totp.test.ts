import { describe, expect, it } from "vitest";
import { base32Decode, base32Encode } from "@/lib/admin/base32";
import { computeTotpAtStep, verifyTotpCode } from "@/lib/admin/totp";

describe("base32", () => {
  it("round-trips arbitrary bytes", () => {
    const original = Buffer.from([0, 1, 2, 253, 254, 255, 42, 100]);
    expect(base32Decode(base32Encode(original))).toEqual(original);
  });

  it("encodes a known RFC 4648 test vector", () => {
    // RFC 4648 §10: BASE32("foobar") = "MZXW6YTBOI======" (unpadded here: "MZXW6YTBOI")
    expect(base32Encode(Buffer.from("foobar"))).toBe("MZXW6YTBOI");
  });
});

describe("TOTP — RFC 6238 Appendix B test vectors (SHA-1)", () => {
  // The RFC's own vectors use the 20-byte ASCII secret "12345678901234567890"
  // and 8-digit codes; this implementation is fixed at 6 digits (matching
  // every real authenticator app). The last 6 digits of an 8-digit HOTP
  // value are mathematically identical to a 6-digit computation at the
  // same counter — (x % 10^8) % 10^6 === x % 10^6 — so comparing the last
  // 6 digits of each published vector is a genuine correctness check, not
  // a weaker one.
  const secret = base32Encode(Buffer.from("12345678901234567890"));

  it.each([
    [1, "287082"], // T=59s -> counter floor(59/30)=1, RFC value 94287082
    [37037036, "081804"], // T=1111111109s, RFC value 07081804
    [37037037, "050471"], // T=1111111111s, RFC value 14050471
    [41152263, "005924"], // T=1234567890s, RFC value 89005924
    [66666666, "279037"], // T=2000000000s, RFC value 69279037
    [666666666, "353130"], // T=20000000000s, RFC value 65353130
  ])("counter %i -> %s", (counter, expected) => {
    expect(computeTotpAtStep(secret, counter)).toBe(expected);
  });
});

describe("verifyTotpCode", () => {
  const secret = base32Encode(Buffer.from("12345678901234567890"));
  const stepSeconds = 30;

  function nowForStep(step: number): number {
    return step * stepSeconds * 1000;
  }

  it("accepts the correct code for the current step", () => {
    const now = nowForStep(1);
    expect(verifyTotpCode(secret, "287082", now)).toBe(true);
  });

  it("accepts a code from one step earlier (clock drift tolerance)", () => {
    // Code for step 1 ("287082"), checked against step 2's clock.
    expect(verifyTotpCode(secret, "287082", nowForStep(2))).toBe(true);
  });

  it("accepts a code from one step later", () => {
    expect(verifyTotpCode(secret, "287082", nowForStep(0))).toBe(true);
  });

  it("rejects a code two steps away", () => {
    expect(verifyTotpCode(secret, "287082", nowForStep(3))).toBe(false);
    expect(verifyTotpCode(secret, "287082", nowForStep(-1))).toBe(false);
  });

  it("rejects a wrong code entirely", () => {
    expect(verifyTotpCode(secret, "000000", nowForStep(1))).toBe(false);
  });

  it("rejects malformed input without throwing", () => {
    expect(verifyTotpCode(secret, "12345", nowForStep(1))).toBe(false);
    expect(verifyTotpCode(secret, "abcdef", nowForStep(1))).toBe(false);
    expect(verifyTotpCode(secret, "", nowForStep(1))).toBe(false);
  });
});
