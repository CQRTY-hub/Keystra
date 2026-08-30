import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { isCheckoutEnabled, setCheckoutEnabled } from "@/lib/kill-switch";
import { getSupplierBalanceStatus } from "@/lib/admin/balance";
import { getEmailProvider } from "@/lib/email";

/**
 * PLAN.md Phase 3.5, "Automatic circuit breakers — this is the part that
 * actually saves money": "A manual button only helps when I'm awake; most
 * disasters happen while I'm not." Four rules, all auto-pausing checkout
 * (Level 2 of the noodknop, src/lib/kill-switch.ts) and alerting the owner
 * by email:
 *
 *   1. N consecutive fulfilment failures within a short window (PLAN.md:
 *      "start at 3 in 5 minutes, tune from real data")
 *   2. Supplier balance drops below the threshold that covers pending
 *      orders (storefront owner, 2026-08-27: "minimaal 50 euro")
 *   3. The supplier API is unreachable or timing out repeatedly
 *   4. Payment succeeds but fulfilment fails more than a set number of
 *      times in an hour (started at 5/hour — same "tune from real data"
 *      reasoning as rule 1, just no PLAN.md number to start from)
 *
 * There is no scheduled-job system yet (see getSupplierBalanceStatus's own
 * comment), so this runs inline, right after a real fulfilment attempt —
 * see src/app/api/webhooks/mollie/route.ts. That is also the only moment
 * these four things are actually knowable: a failure just happened, or a
 * balance call was just worth making.
 */

const CONSECUTIVE_FAILURE_THRESHOLD = 3;
const CONSECUTIVE_FAILURE_WINDOW_MS = 5 * 60 * 1000;
const HOURLY_FAILURE_THRESHOLD = 5;
const HOURLY_FAILURE_WINDOW_MS = 60 * 60 * 1000;
const SUPPLIER_UNREACHABLE_STREAK = 3;

export type CircuitBreakerId =
  | "consecutive_fulfilment_failures"
  | "fulfilment_failures_hourly"
  | "supplier_unreachable"
  | "low_supplier_balance";

export interface CircuitBreakerTrigger {
  id: CircuitBreakerId;
  detail: string;
}

/**
 * Pure — given raw counts, decides which fulfilment-related breakers (the
 * first three rules above; the balance rule is checked separately, see
 * checkLowBalanceCircuitBreaker) should trip. Kept separate from the
 * EventLog queries that produce these counts so the actual trip logic has
 * its own test coverage, same pattern as decideWebhookAction
 * (src/lib/webhooks.ts) and decideRiskHold (src/lib/risk-decision.ts).
 */
export function decideFulfilmentBreakers(input: {
  failuresIn5Min: number;
  failuresInHour: number;
  lastCallsAllUnreachable: boolean;
}): CircuitBreakerTrigger[] {
  const triggers: CircuitBreakerTrigger[] = [];

  if (input.failuresIn5Min >= CONSECUTIVE_FAILURE_THRESHOLD) {
    triggers.push({
      id: "consecutive_fulfilment_failures",
      detail: `${input.failuresIn5Min} fulfilment failures in the last 5 minutes (threshold ${CONSECUTIVE_FAILURE_THRESHOLD}).`,
    });
  }

  if (input.failuresInHour >= HOURLY_FAILURE_THRESHOLD) {
    triggers.push({
      id: "fulfilment_failures_hourly",
      detail: `${input.failuresInHour} fulfilment failures in the last hour (threshold ${HOURLY_FAILURE_THRESHOLD}).`,
    });
  }

  if (input.lastCallsAllUnreachable) {
    triggers.push({
      id: "supplier_unreachable",
      detail: `The last ${SUPPLIER_UNREACHABLE_STREAK} supplier calls all timed out or errored — the supplier API looks unreachable.`,
    });
  }

  return triggers;
}

async function countRecentFailures(windowMs: number): Promise<number> {
  return prisma.eventLog.count({
    where: {
      eventType: "supplier.order_failed",
      createdAt: { gte: new Date(Date.now() - windowMs) },
    },
  });
}

/**
 * True only if the most recent SUPPLIER_UNREACHABLE_STREAK fulfilment
 * attempts (success or failure, across any order) were ALL failures with
 * reason "timeout" or "unknown" — the two KeyResult reasons that mean the
 * call itself broke, as opposed to "out_of_stock"/"empty_balance", which
 * mean the call succeeded and the supplier gave a real business answer.
 * A single recent success clears this — that's what "unreachable" should
 * mean, not "had some trouble."
 */
async function lastCallsAllUnreachable(): Promise<boolean> {
  const recent = await prisma.eventLog.findMany({
    where: { eventType: { in: ["supplier.order_failed", "supplier.order_key"] } },
    orderBy: { createdAt: "desc" },
    take: SUPPLIER_UNREACHABLE_STREAK,
  });

  if (recent.length < SUPPLIER_UNREACHABLE_STREAK) return false;

  return recent.every((event) => {
    if (event.eventType !== "supplier.order_failed") return false;
    const payload = event.payload as { reason?: string } | null;
    return payload?.reason === "timeout" || payload?.reason === "unknown";
  });
}

/**
 * Checks the three fulfilment-related breakers and auto-pauses checkout
 * if any trip. Call this right after logging a supplier.order_failed
 * event — a success can never push a failure count over threshold, so
 * there is nothing new to check after one.
 */
export async function checkFulfilmentCircuitBreakers(): Promise<void> {
  const [failuresIn5Min, failuresInHour, unreachable] = await Promise.all([
    countRecentFailures(CONSECUTIVE_FAILURE_WINDOW_MS),
    countRecentFailures(HOURLY_FAILURE_WINDOW_MS),
    lastCallsAllUnreachable(),
  ]);

  const triggers = decideFulfilmentBreakers({
    failuresIn5Min,
    failuresInHour,
    lastCallsAllUnreachable: unreachable,
  });

  for (const trigger of triggers) {
    await tripBreaker(trigger);
  }
}

/**
 * The balance breaker. Checked once per order's fulfilment pass, not per
 * item — it makes a live supplier API call, and this codebase is
 * deliberately conservative about calling that outside checkout or an
 * explicit admin action (see getSupplierBalanceStatus's own comment).
 * Also fires on a healthy fulfilment run, deliberately — the balance can
 * drop below the threshold purely as a side effect of a SUCCESSFUL
 * order, with no failure anywhere to hang the check off of.
 */
export async function checkLowBalanceCircuitBreaker(): Promise<void> {
  const status = await getSupplierBalanceStatus();
  if (!status.available || !status.low) return;

  const balance = (status.balanceCents / 100).toFixed(2);
  const threshold = ((status.thresholdCents ?? 0) / 100).toFixed(2);

  await tripBreaker({
    id: "low_supplier_balance",
    detail: `Supplier balance is €${balance}, below the €${threshold} threshold. Top up the CodesWholesale account.`,
  });
}

const BREAKER_ACTOR = "system:circuit_breaker";

async function tripBreaker(trigger: CircuitBreakerTrigger): Promise<void> {
  // Idempotent: if checkout is already paused — by this breaker, by a
  // different breaker, or by a human on /admin/kill-switch — don't
  // re-pause and don't re-alert on every subsequent failure. After the
  // first trip it's the same ongoing incident, not a new one each time.
  if (!(await isCheckoutEnabled())) return;

  await logEvent({
    eventType: "admin.circuit_breaker_triggered",
    payload: { breaker: trigger.id, detail: trigger.detail },
  });

  await setCheckoutEnabled(false, BREAKER_ACTOR, `Auto-paused: ${trigger.detail}`);

  await alertAdmin(trigger);
}

async function alertAdmin(trigger: CircuitBreakerTrigger): Promise<void> {
  // Single-admin-account app (PLAN.md, Phase 3.5 "Access") — there is
  // nowhere else to send this. If the credential row is somehow missing,
  // there's no address to alert; the pause itself (and its EventLog
  // entry) has still happened, which is the part that actually protects
  // money.
  const admin = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (!admin) return;

  await getEmailProvider().send({
    to: admin.email,
    template: "admin_alert",
    subject: `Keystra: checkout auto-paused (${trigger.id})`,
    body: `${trigger.detail}\n\nCheckout has been paused automatically. Resolve the underlying problem, then resume checkout from /admin/kill-switch.`,
  });
}
