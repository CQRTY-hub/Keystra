import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * The ONLY function in the codebase allowed to write to the EventLog table.
 * Every supplier call, every payment webhook, and every consent action
 * writes through here — never via `prisma.eventLog.create(...)` directly
 * anywhere else. This is what makes the log a reliable chargeback defence:
 * one call site to get right, instead of trusting every route to remember.
 *
 * If you're adding a new EventLog write and reaching for `prisma.eventLog`
 * directly, stop — call `logEvent()` instead.
 */

export type EventType =
  | "supplier.check_availability"
  | "supplier.order_key"
  | "supplier.order_failed"
  | "payment.webhook_received"
  | "payment.webhook_duplicate_ignored"
  | "payment.webhook_invalid"
  | "payment.confirmed"
  | "payment.authorized"
  | "payment.failed"
  | "payment.expired"
  | "payment.canceled"
  | "payment.status_unhandled"
  | "payment.refunded"
  | "invoice.issued"
  | "invoice.skipped_missing_customer_details"
  | "invoice.failed"
  | "order.created"
  | "order.status_changed"
  | "order.held"
  | "order.awaiting_code"
  | "order.risk_assessed"
  | "order.risk_check_failed"
  | "consent.terms_accepted"
  | "consent.withdrawal_waiver_accepted"
  | "consent.cookie_consent_set"
  | "email.send_attempted"
  | "email.send_failed"
  | "admin.kill_switch_changed"
  | "admin.login_succeeded"
  | "admin.login_failed"
  | "admin.account_locked"
  | "admin.logout"
  | "admin.product_active_changed"
  | "admin.product_cost_refreshed"
  | "admin.maintenance_mode_changed"
  | "admin.pricing_rule_updated"
  | "admin.circuit_breaker_triggered";

interface LogEventInput {
  orderId?: string;
  eventType: EventType;
  payload: Prisma.InputJsonValue;
}

// Field names that must never appear with their real value in a payload.
// This is a safety net, not the primary control — the primary control is
// simply never putting a key value into a payload in the first place.
const FORBIDDEN_KEY_FIELDS = new Set([
  "key",
  "keyValue",
  "value",
  "code",
  "codeValue",
]);

/**
 * Defensively strips anything that looks like it's carrying a raw key
 * value before it ever reaches the database or Sentry. Truncates known
 * key-shaped field names rather than trusting every call site to remember.
 */
function redact(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(redact);
  }
  if (payload && typeof payload === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (FORBIDDEN_KEY_FIELDS.has(k) && typeof v === "string") {
        out[k] = `[redacted:${v.length} chars]`;
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return payload;
}

export async function logEvent({ orderId, eventType, payload }: LogEventInput) {
  const safePayload = redact(payload) as Prisma.InputJsonValue;

  return prisma.eventLog.create({
    data: {
      orderId,
      eventType,
      payload: safePayload,
    },
  });
}
