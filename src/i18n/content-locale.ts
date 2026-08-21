/**
 * A separate, smaller locale concept from src/i18n/index.ts's
 * Locale/getMessages(). The shop's general UI (nav, buttons, checkout
 * labels) stays English-only — PLAN.md: "keep the shop in English." Only
 * the four legal/instructional content pieces that carry legal weight
 * (terms, refund/withdrawal policy, the redemption guides, the
 * withdrawal-waiver text) get a Dutch counterpart, reachable via a
 * simple `?lang=nl` toggle on their own pages — not a site-wide locale
 * switch, not a routing change to every page.
 */
export type ContentLocale = "en" | "nl";
export const DEFAULT_CONTENT_LOCALE: ContentLocale = "en";

export function parseContentLocale(value: string | undefined): ContentLocale {
  return value === "nl" ? "nl" : DEFAULT_CONTENT_LOCALE;
}
