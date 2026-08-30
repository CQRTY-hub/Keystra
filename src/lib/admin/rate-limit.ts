import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";

/**
 * Two independent layers, per the storefront owner's explicit request
 * ("Rate limiting and lockout after repeated failed attempts") — either
 * alone has a real gap:
 *
 * - **Account lockout** (AdminCredential.failedAttempts/lockedUntil):
 *   stops a slow, patient guesser regardless of where they connect from.
 *   Gap on its own: an attacker who WANTS to lock the real owner out just
 *   has to fail on purpose.
 * - **Per-IP throttling** (queried from EventLog — no new table; every
 *   attempt is already logged there per PLAN.md's "every admin action
 *   writes to EventLog"): slows a single source down without touching
 *   the account's own lock state, so it can't be used to lock the owner
 *   out. Gap on its own: doesn't stop a distributed/slow attempt.
 *
 * Together: an attacker is throttled fast by IP, and even a distributed
 * attempt still can't out-guess the account lock, which only the real
 * owner's correct password+TOTP can ever clear (it resets on success).
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_ATTEMPTS = 10;

export interface RateLimitCheck {
  allowed: boolean;
  /** Present only when allowed is false — for the message shown to the user. */
  reason?: "ip_throttled" | "account_locked";
  retryAfterMs?: number;
}

/**
 * Call BEFORE attempting to verify a password or TOTP code. Checks both
 * layers without recording anything — recording happens in
 * recordLoginFailure/recordLoginSuccess below, after the actual
 * credential check, so a throttled request doesn't also get counted
 * twice.
 */
export async function checkLoginRateLimit(ip: string): Promise<RateLimitCheck> {
  const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (credential?.lockedUntil && credential.lockedUntil > new Date()) {
    return {
      allowed: false,
      reason: "account_locked",
      retryAfterMs: credential.lockedUntil.getTime() - Date.now(),
    };
  }

  const recentFailuresFromIp = await prisma.eventLog.count({
    where: {
      eventType: "admin.login_failed",
      createdAt: { gte: new Date(Date.now() - IP_WINDOW_MS) },
      payload: { path: ["ip"], equals: ip },
    },
  });
  if (recentFailuresFromIp >= IP_MAX_ATTEMPTS) {
    return { allowed: false, reason: "ip_throttled", retryAfterMs: IP_WINDOW_MS };
  }

  return { allowed: true };
}

/**
 * Records a failed step (wrong password OR wrong TOTP code — both count
 * the same way) and, if this crosses the account threshold, locks it.
 * Never receives or logs the attempted password/code itself — only the
 * outcome and why.
 */
export async function recordLoginFailure(input: {
  ip: string;
  email: string;
  reason: "invalid_password" | "invalid_totp" | "no_challenge";
}): Promise<void> {
  await logEvent({
    eventType: "admin.login_failed",
    payload: { ip: input.ip, email: input.email, reason: input.reason },
  });

  // "no_challenge" (hitting the TOTP step without a valid step-1 pass)
  // doesn't count against the account lock — it's not a credential
  // guess, just a broken/expired/replayed flow.
  if (input.reason === "no_challenge") return;

  const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (!credential) return;

  const failedAttempts = credential.failedAttempts + 1;
  const lockingNow = failedAttempts >= MAX_FAILED_ATTEMPTS;

  await prisma.adminCredential.update({
    where: { id: 1 },
    data: {
      failedAttempts,
      lockedUntil: lockingNow ? new Date(Date.now() + LOCKOUT_DURATION_MS) : credential.lockedUntil,
    },
  });

  if (lockingNow) {
    await logEvent({
      eventType: "admin.account_locked",
      payload: { ip: input.ip, email: input.email, failedAttempts },
    });
  }
}

export async function recordLoginSuccess(input: { ip: string; email: string }): Promise<void> {
  await prisma.adminCredential.update({
    where: { id: 1 },
    data: { failedAttempts: 0, lockedUntil: null },
  });
  await logEvent({
    eventType: "admin.login_succeeded",
    payload: { ip: input.ip, email: input.email },
  });
}
