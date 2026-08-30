import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { base32Decode, base32Encode } from "./base32";

/**
 * RFC 6238 TOTP, hand-rolled deliberately — this project avoids adding a
 * dependency for something Node's built-in crypto already covers (same
 * reasoning as password.ts using scrypt instead of bcrypt). TOTP itself
 * is a compact, precisely-specified algorithm (RFC 4226 HOTP + a time
 * step), not something with much room for a library to get more "right."
 * Standard parameters throughout — 30s step, SHA-1, 6 digits — because
 * those are what every authenticator app (Google Authenticator, Authy,
 * 1Password, ...) assumes; deviating breaks compatibility with all of
 * them for no benefit.
 *
 * Correctness is pinned down by tests/admin-totp.test.ts against RFC
 * 6238's own published test vectors — not just "it round-trips."
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const SECRET_BYTES = 20; // 160 bits — RFC 4226's recommended HMAC-SHA1 key size
/** Accept a code from one step earlier or later — clock drift and the
 *  time it takes a human to type a code are both real. */
const WINDOW_STEPS = 1;

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(SECRET_BYTES));
}

/**
 * The otpauth:// URI an authenticator app scans (as a QR code) or a
 * human copies in by hand. No QR rendering here — scripts/admin-setup.ts
 * prints this as text; turning it into a QR code is the owner's own
 * authenticator app's job (most accept typing the secret in directly).
 */
export function totpUri(email: string, secret: string): string {
  const label = encodeURIComponent(`Keystra Admin:${email}`);
  const issuer = encodeURIComponent("Keystra Admin");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

function hotp(secret: Buffer, counter: number): string {
  if (counter < 0 || !Number.isInteger(counter)) {
    throw new RangeError(`HOTP counter must be a non-negative integer, got ${counter}.`);
  }
  // RFC 4226: the 8-byte counter is big-endian. BigInt avoids the
  // hand-split-into-two-uint32s approach's sign bug (Math.floor(n / 2**32)
  // goes negative for small counters and writeUInt32BE rejects that).
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", secret).update(counterBuffer).digest();
  // .readUInt8/.readUInt32BE (vs. indexing hmac[i] directly) sidestep
  // noUncheckedIndexedAccess's "possibly undefined" — these are always
  // in range for a 20-byte SHA-1 digest, just not provably so to TS.
  const offset = hmac.readUInt8(hmac.length - 1) & 0x0f;
  // Dynamic truncation (RFC 4226 §5.3): take 4 bytes starting at
  // `offset` and clear the top bit — equivalent to masking the
  // big-endian uint32 with 0x7fffffff.
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** Pure — takes `now` explicitly so it's testable without a real clock. */
export function computeTotpAtStep(secret: string, step: number): string {
  return hotp(base32Decode(secret), step);
}

function stepFor(nowMs: number): number {
  return Math.floor(nowMs / 1000 / STEP_SECONDS);
}

/**
 * Timing-safe by construction: every candidate in the window is computed
 * and compared with `timingSafeEqual` regardless of whether an earlier
 * one already matched, so response time doesn't leak which step (if any)
 * was correct.
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  now: number = Date.now()
): boolean {
  if (!/^\d{6}$/.test(code)) return false;

  const currentStep = stepFor(now);
  const codeBuffer = Buffer.from(code);
  let matched = false;

  for (let offset = -WINDOW_STEPS; offset <= WINDOW_STEPS; offset++) {
    const step = currentStep + offset;
    if (step < 0) continue; // only possible with a pre-1970 clock — never in practice
    const candidate = Buffer.from(computeTotpAtStep(secret, step));
    if (candidate.length === codeBuffer.length && timingSafeEqual(candidate, codeBuffer)) {
      matched = true;
    }
  }
  return matched;
}
