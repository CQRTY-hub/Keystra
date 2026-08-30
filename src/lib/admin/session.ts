import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * DB-backed sessions and login challenges — same reasoning as the kill
 * switch (PLAN.md: state that has to be revocable and work identically
 * from any device lives in the database, not in a signed-cookie-only
 * scheme that can't be un-issued). See prisma/schema.prisma's
 * AdminSession/AdminLoginChallenge for the tables this reads and writes.
 */

const SESSION_COOKIE = "keystra_admin_session";
const CHALLENGE_COOKIE = "keystra_admin_challenge";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const CHALLENGE_DURATION_MS = 5 * 60 * 1000; // 5 minutes — just long enough to type a TOTP code

function newToken(): string {
  return randomBytes(32).toString("hex");
}

function cookieOptions(maxAgeMs: number, path: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

// ---------------------------------------------------------------------
// Login challenge — step 1 (password) passing issues one of these; step
// 2 (TOTP) must consume it before a real session is created.
// ---------------------------------------------------------------------

export async function createLoginChallenge(): Promise<void> {
  const challenge = await prisma.adminLoginChallenge.create({
    data: { expiresAt: new Date(Date.now() + CHALLENGE_DURATION_MS) },
  });

  const store = await cookies();
  store.set(
    CHALLENGE_COOKIE,
    challenge.id,
    cookieOptions(CHALLENGE_DURATION_MS, "/admin/login")
  );
}

/**
 * Reads the challenge id from the cookie, and — only if it's still valid
 * and unconsumed — marks it consumed and returns true. Single-use: a
 * second call with the same cookie (replay, or hitting back and
 * resubmitting) returns false.
 */
export async function consumeLoginChallenge(): Promise<boolean> {
  const store = await cookies();
  const challengeId = store.get(CHALLENGE_COOKIE)?.value;
  if (!challengeId) return false;

  const challenge = await prisma.adminLoginChallenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
    return false;
  }

  await prisma.adminLoginChallenge.update({
    where: { id: challengeId },
    data: { consumedAt: new Date() },
  });
  store.delete(CHALLENGE_COOKIE);
  return true;
}

/** Fails closed: a database error here means "not valid," never "assume valid." */
export async function hasValidLoginChallenge(): Promise<boolean> {
  const store = await cookies();
  const challengeId = store.get(CHALLENGE_COOKIE)?.value;
  if (!challengeId) return false;

  try {
    const challenge = await prisma.adminLoginChallenge.findUnique({
      where: { id: challengeId },
    });
    return !!challenge && !challenge.consumedAt && challenge.expiresAt >= new Date();
  } catch (err) {
    console.error("hasValidLoginChallenge: could not verify challenge:", err);
    return false;
  }
}

// ---------------------------------------------------------------------
// Session — created only after step 2 (TOTP) succeeds.
// ---------------------------------------------------------------------

export async function createSession(): Promise<void> {
  const session = await prisma.adminSession.create({
    data: { expiresAt: new Date(Date.now() + SESSION_DURATION_MS) },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, session.id, cookieOptions(SESSION_DURATION_MS, "/admin"));
}

/** True if there's a currently-valid session — doesn't redirect. Fails
 *  closed: a database error here means "not valid," never "assume valid." */
export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return false;

  try {
    const session = await prisma.adminSession.findUnique({ where: { id: sessionId } });
    return !!session && session.expiresAt >= new Date();
  } catch (err) {
    console.error("hasValidSession: could not verify session:", err);
    return false;
  }
}

/**
 * For every protected admin page/action: redirects to the login page if
 * there's no valid session, otherwise touches `lastSeenAt` (informational
 * only — doesn't extend expiresAt; a session's lifetime is fixed at
 * creation, not sliding, to keep the expiry story simple to reason about).
 */
export async function requireAdminSession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;

  // Fail closed, same instinct as src/lib/kill-switch.ts's
  // isCheckoutEnabled(): if the database can't be reached, that is not
  // "assume the session is fine" — it's "we cannot prove access is
  // authorized," which must never grant it. redirect() itself throws,
  // so it's outside the try — this only catches a genuine DB failure.
  let session: { id: string; expiresAt: Date } | null = null;
  try {
    session = sessionId
      ? await prisma.adminSession.findUnique({ where: { id: sessionId } })
      : null;
  } catch (err) {
    console.error("requireAdminSession: could not verify session:", err);
    redirect("/admin/login");
  }

  if (!session || session.expiresAt < new Date()) {
    redirect("/admin/login");
  }

  try {
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
  } catch {
    // Informational touch only — a failure here doesn't invalidate an
    // already-confirmed-valid session.
  }
}

/**
 * For every admin Server Action (not page — pages use requireAdminSession()
 * above): Server Actions are independently invocable and don't inherit a
 * page's own auth check, so every mutation needs its own guard. Redirects
 * to login the same way requireAdminSession() does, and additionally
 * returns the admin's email — every admin-panel EventLog write needs an
 * "actor," and there's only ever the one account to fetch it from.
 */
export async function requireAdminActor(): Promise<string> {
  await requireAdminSession();
  const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  // requireAdminSession() only just confirmed a valid session exists, so
  // in practice the credential row is always there too — but session and
  // credential are separate tables, so this stays honest about the type
  // rather than asserting it.
  return credential?.email ?? "unknown";
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  // Cookie cleared FIRST, deliberately: if the database row's deletion
  // below throws (e.g. unreachable), the browser must still lose the
  // session cookie — an orphaned DB row is a low-risk cleanup gap, but a
  // cookie that survives a failed logout is a bigger problem.
  store.delete(SESSION_COOKIE);
  if (sessionId) {
    try {
      await prisma.adminSession.deleteMany({ where: { id: sessionId } });
    } catch (err) {
      console.error("destroySession: could not delete session row:", err);
    }
  }
}
