import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";

/**
 * The kill switch from PLAN.md Phase 1 point 8: a database flag, not an
 * env var and not a code constant, so stopping sales never requires a
 * deploy. Checkout must call `isCheckoutEnabled()` before taking payment.
 *
 * Fails CLOSED: if the settings row can't be read (DB unreachable,
 * migration not yet run), checkout is treated as disabled rather than
 * enabled. An outage that blocks a sale is recoverable; an outage that
 * silently lets sales through with nothing actually working is not.
 */

const SETTINGS_ID = 1;

export async function isCheckoutEnabled(): Promise<boolean> {
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    // No row yet (fresh DB, no seed run) -> fail closed.
    if (!settings) return false;
    return settings.checkoutEnabled;
  } catch {
    // DB unreachable -> fail closed. Do not let a connection error look
    // like "checkout is fine."
    return false;
  }
}

export async function setCheckoutEnabled(
  enabled: boolean,
  actor: string,
  reason?: string
): Promise<void> {
  const before = await prisma.shopSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  const settings = await prisma.shopSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      checkoutEnabled: enabled,
      checkoutPausedAt: enabled ? null : new Date(),
      checkoutPausedBy: enabled ? null : actor,
      checkoutPauseReason: enabled ? null : reason,
    },
    update: {
      checkoutEnabled: enabled,
      checkoutPausedAt: enabled ? null : new Date(),
      checkoutPausedBy: enabled ? null : actor,
      checkoutPauseReason: enabled ? null : reason,
    },
  });

  await logEvent({
    eventType: "admin.kill_switch_changed",
    payload: {
      before: before?.checkoutEnabled ?? null,
      after: settings.checkoutEnabled,
      actor,
      reason: reason ?? null,
    },
  });
}
