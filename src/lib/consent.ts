import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  TERMS_VERSION,
  WITHDRAWAL_WAIVER_VERSION,
  WITHDRAWAL_WAIVER_TEXT,
  type CookieConsentValue,
} from "@/lib/consent-text";

/**
 * Server-only. Never import this from a Client Component — the constants
 * and types live in src/lib/consent-text.ts specifically so components
 * like CheckoutForm and CookieConsent can use the wording without pulling
 * Prisma or next/headers into the client bundle. The cookie banner's
 * write path is a separate file too: src/lib/actions/consent-actions.ts.
 *
 * Both consent moments the shop has to get right (PLAN.md, Phase 1 points
 * 6 and 7, and Appendix items 1 and 2) follow the same pattern: record
 * consent, remember which wording version was shown, never assume it,
 * never write EventLog directly — always via logEvent().
 */

export {
  COOKIE_CONSENT_COOKIE_NAME,
  TERMS_VERSION,
  WITHDRAWAL_WAIVER_VERSION,
  WITHDRAWAL_WAIVER_TEXT,
};
export type { CookieConsentValue };

/** Server Components only — read the visitor's current cookie choice. */
export async function getCookieConsent(): Promise<CookieConsentValue | null> {
  const store = await cookies();
  const value = store.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  return value === "accepted" || value === "rejected" ? value : null;
}

interface RecordCheckoutConsentInput {
  orderId: string;
  termsAccepted: boolean;
  withdrawalWaiverAccepted: boolean;
}

/**
 * Called server-side from the checkout route, never from the client.
 * Both checkboxes are required before this is ever called with `true` —
 * checkout must refuse to proceed otherwise (see the checkout page /
 * API route, not this module).
 */
export async function recordCheckoutConsent({
  orderId,
  termsAccepted,
  withdrawalWaiverAccepted,
}: RecordCheckoutConsentInput): Promise<void> {
  if (!termsAccepted || !withdrawalWaiverAccepted) {
    throw new Error(
      "recordCheckoutConsent called without both checkboxes accepted — checkout must not reach this point."
    );
  }

  const now = new Date();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      termsAcceptedAt: now,
      termsVersion: TERMS_VERSION,
      withdrawalWaiverAcceptedAt: now,
      withdrawalWaiverVersion: WITHDRAWAL_WAIVER_VERSION,
    },
  });

  await logEvent({
    orderId,
    eventType: "consent.terms_accepted",
    payload: { version: TERMS_VERSION, acceptedAt: now.toISOString() },
  });

  await logEvent({
    orderId,
    eventType: "consent.withdrawal_waiver_accepted",
    payload: {
      version: WITHDRAWAL_WAIVER_VERSION,
      wording: WITHDRAWAL_WAIVER_TEXT,
      acceptedAt: now.toISOString(),
    },
  });
}
