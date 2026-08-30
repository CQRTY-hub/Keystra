import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/**
 * Node's built-in scrypt, not bcrypt/argon2 — no new dependency for a
 * single admin account, same reasoning as totp.ts using Node's crypto
 * directly instead of a TOTP library. scrypt is a well-regarded
 * password-hashing KDF (RFC 7914), memory-hard by design, and it's
 * already in Node — nothing to add, nothing to keep patched separately.
 *
 * Stored format: "scrypt:<salt-hex>:<hash-hex>" — self-describing so a
 * future algorithm change (e.g. moving to argon2 in Phase 3.8) can
 * detect and reject/upgrade old hashes instead of silently
 * misinterpreting them.
 */

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  // Length check above guarantees these two exist, but noUncheckedIndexedAccess
  // can't infer that from a runtime check — assert instead of a second
  // redundant guard.
  const saltHex = parts[1]!;
  const hashHex = parts[2]!;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  // Buffers are guaranteed equal length here (both KEY_LENGTH), so
  // timingSafeEqual is safe to call unconditionally — no early return
  // based on a length mismatch that would leak timing information.
  return timingSafeEqual(derived, expected);
}
