import en, { type Messages } from "./messages/en";

/**
 * Only "en" exists today. Adding a locale is: write
 * src/i18n/messages/xx.ts with this same shape, register it in
 * `catalogs` below, and decide where the chosen locale comes from (a
 * cookie, Accept-Language, a URL segment — not decided yet, since there
 * was nothing to choose between until now).
 */
export type Locale = "en";
export const DEFAULT_LOCALE: Locale = "en";

const catalogs: Record<Locale, Messages> = { en };

/**
 * Synchronous by design — messages are a static import, not fetched.
 * Works identically in Server and Client Components; nothing here is
 * React-specific. Call it once per component/page:
 *
 *   const t = getMessages();
 *   <h1>{t.shop.title}</h1>
 */
export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return catalogs[locale];
}

export type { Messages };
