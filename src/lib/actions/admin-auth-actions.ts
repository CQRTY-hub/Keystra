"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { getMessages } from "@/i18n";
import { verifyPassword } from "@/lib/admin/password";
import { verifyTotpCode } from "@/lib/admin/totp";
import { getClientIp } from "@/lib/request-ip";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/admin/rate-limit";
import {
  consumeLoginChallenge,
  createLoginChallenge,
  createSession,
  destroySession,
  hasValidLoginChallenge,
} from "@/lib/admin/session";

/**
 * Two Server Actions, one per login step, plus logout. Deliberately in
 * their own "use server" file — same reasoning as consent-actions.ts.
 *
 * Never log an attempted password or TOTP code, only the outcome —
 * rate-limit.ts's recordLoginFailure() only ever receives a reason
 * category, never the submitted value.
 */

export interface LoginActionState {
  error: string | null;
}

export async function loginPassword(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const t = getMessages();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const ip = getClientIp(await headers());

  // redirect() works by throwing — it's deliberately called OUTSIDE this
  // try/catch (after it returns a "proceed" signal) so this block only
  // ever catches a real failure (e.g. the database being unreachable),
  // never its own successful navigation. Same fail-closed instinct as
  // src/lib/kill-switch.ts: if we can't actually verify the credential,
  // that is not a login, full stop — never fall through to "proceed."
  let shouldProceedToVerify = false;
  try {
    const rateLimit = await checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return { error: lockedOrThrottledMessage(rateLimit) };
    }

    const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
    const emailMatches = !!credential && credential.email.toLowerCase() === email;
    const passwordOk =
      emailMatches && credential ? await verifyPassword(password, credential.passwordHash) : false;

    if (!emailMatches || !passwordOk) {
      // Same generic message either way — never reveal whether the
      // email itself was even recognized.
      await recordLoginFailure({ ip, email, reason: "invalid_password" });
      return { error: t.admin.errors.invalidCredentials };
    }

    await createLoginChallenge();
    shouldProceedToVerify = true;
  } catch (err) {
    console.error("admin loginPassword failed:", err);
    return { error: t.admin.errors.unexpected };
  }

  if (shouldProceedToVerify) redirect("/admin/login/verify");
  return { error: t.admin.errors.unexpected };
}

export async function loginTotp(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const t = getMessages();
  const code = String(formData.get("code") ?? "").trim();
  const ip = getClientIp(await headers());

  let shouldProceedToAdmin = false;
  try {
    if (!(await hasValidLoginChallenge())) {
      return { error: t.admin.errors.challengeExpired };
    }

    const rateLimit = await checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return { error: lockedOrThrottledMessage(rateLimit) };
    }

    const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
    const codeOk = credential ? verifyTotpCode(credential.totpSecret, code) : false;

    if (!codeOk || !credential) {
      await recordLoginFailure({
        ip,
        email: credential?.email ?? "unknown",
        reason: "invalid_totp",
      });
      return { error: t.admin.errors.invalidCode };
    }

    await consumeLoginChallenge();
    await createSession();
    await recordLoginSuccess({ ip, email: credential.email });
    shouldProceedToAdmin = true;
  } catch (err) {
    console.error("admin loginTotp failed:", err);
    return { error: t.admin.errors.unexpected };
  }

  if (shouldProceedToAdmin) redirect("/admin");
  return { error: t.admin.errors.unexpected };
}

export async function adminLogout(): Promise<void> {
  // Best-effort — see destroySession()'s own comment for why the cookie
  // is cleared before the (fallible) database cleanup, not after.
  try {
    const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
    await destroySession();
    await logEvent({
      eventType: "admin.logout",
      payload: { email: credential?.email ?? "unknown" },
    });
  } catch (err) {
    console.error("admin adminLogout cleanup failed:", err);
  }
  redirect("/admin/login");
}

function lockedOrThrottledMessage(rateLimit: { reason?: string; retryAfterMs?: number }): string {
  const t = getMessages();
  const minutes = rateLimit.retryAfterMs ? Math.ceil(rateLimit.retryAfterMs / 60_000) : null;
  if (rateLimit.reason === "account_locked") {
    return minutes ? t.admin.errors.accountLocked(minutes) : t.admin.errors.accountLockedNoTime;
  }
  return t.admin.errors.ipThrottled;
}
