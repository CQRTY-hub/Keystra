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
export const TERMS_VERSION = "2026-08-19";
export const WITHDRAWAL_WAIVER_VERSION = "2026-08-19";

export const WITHDRAWAL_WAIVER_TEXT =
  "Ik ga ermee akkoord dat de levering van deze digitale game key " +
  "onmiddellijk begint, en ik erken dat ik daardoor mijn wettelijk " +
  "herroepingsrecht van 14 dagen verlies zodra de key aan mij is getoond " +
  "of gemaild.";
