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

/**
 * Canonical + hreflang for a page with an English default and a
 * `?lang=nl` variant. The English URL is canonical — `?lang=nl` is a
 * view of the same page, not a separately-indexed one — with hreflang
 * pointing search engines at both so a Dutch searcher gets offered the
 * Dutch variant instead of the page just quietly claiming to be English
 * (which is what a static, always-English <title> effectively did).
 */
export function languageAlternates(basePath: string) {
  return {
    canonical: basePath,
    languages: {
      en: basePath,
      nl: `${basePath}?lang=nl`,
    },
  };
}
