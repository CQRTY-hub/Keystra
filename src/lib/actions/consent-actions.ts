"use server";

import { cookies } from "next/headers";
import { logEvent } from "@/lib/event-log";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  type CookieConsentValue,
} from "@/lib/consent-text";

/**
 * The one Server Action the cookie banner calls. Lives in its own
 * top-level "use server" file — mixing an inline "use server" function
 * into a module that also gets bundled for a Client Component isn't
 * allowed, hence the split from src/lib/consent.ts.
 */
export async function recordCookieConsent(
  value: CookieConsentValue
): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_CONSENT_COOKIE_NAME, value, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false, // client needs to read it to keep the banner hidden
  });

  await logEvent({
    eventType: "consent.cookie_consent_set",
    payload: { value },
  });
}
