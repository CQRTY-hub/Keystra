import withdrawalWaiverEn from "@/i18n/legal/withdrawal-waiver.en";

/**
 * Plain constants only — no server-only imports (no `next/headers`, no
 * Prisma). This file gets bundled into client components (the checkout
 * form, the cookie banner both need this text), so it has to stay free
 * of anything that only works on the server. The functions that actually
 * *record* consent live in src/lib/consent.ts (checkout) and
 * src/lib/actions/consent-actions.ts (cookie banner) instead.
 */

export const COOKIE_CONSENT_COOKIE_NAME = "cookie_consent";
export type CookieConsentValue = "accepted" | "rejected";

// Bump these — and only these, never edit the wording in place — whenever
// the shown text changes. Every order stores which version it saw.
//
// Bumped 2026-08-20: the shop switched from Dutch to English copy
// (PLAN.md, "Product scope and launch decisions" — English only at
// launch). The wording itself changed, not just its language, so this
// is a new version, not a translation of the old one in place.
export const TERMS_VERSION = "2026-08-20";
export const WITHDRAWAL_WAIVER_VERSION = "2026-08-20";

export const WITHDRAWAL_WAIVER_TEXT = withdrawalWaiverEn.text;
