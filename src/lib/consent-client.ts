"use client";

import { COOKIE_CONSENT_COOKIE_NAME, type CookieConsentValue } from "@/lib/consent-text";

/**
 * Shared by the cookie banner and the /cookie-preferences page — both
 * need to read the visitor's current choice from document.cookie
 * client-side (it doesn't exist during SSR, so this can't run during
 * render). Kept out of consent-text.ts, which is plain constants only.
 */
export function readCookieConsentFromDocument(): CookieConsentValue | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_CONSENT_COOKIE_NAME}=`));
  const value = match?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}
