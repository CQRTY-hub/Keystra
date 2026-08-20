"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  type CookieConsentValue,
} from "@/lib/consent-text";
import { recordCookieConsent } from "@/lib/actions/consent-actions";

/**
 * Nothing non-essential fires before a visible choice is made here, and
 * rejecting is exactly as easy as accepting — one button each, same
 * size, same step. See PLAN.md Phase 1 point 7 and Appendix item 2.
 *
 * No analytics or other optional script exists anywhere in the app yet.
 * When one is added, it must be gated behind an "accepted" read of
 * getCookieConsent() (server) or this component's state (client) — never
 * added unconditionally.
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from document.cookie, which doesn't exist during
    // SSR — there's no way to know the visitor's prior choice until this
    // runs on the client, so this can't be computed during render.
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_CONSENT_COOKIE_NAME}=`));
    const value = match?.split("=")[1];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(value === "accepted" || value === "rejected" ? value : null);
    setReady(true);
  }, []);

  async function choose(value: CookieConsentValue) {
    setChoice(value); // hide immediately, don't wait on the network
    try {
      await recordCookieConsent(value);
    } catch {
      // If logging the choice fails, still respect it in the browser —
      // never re-show the banner and risk annoying a visitor who already
      // answered. The next render's cookie read is the source of truth.
    }
  }

  if (!ready || choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookievoorkeuren"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-white p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-900">
          We gebruiken alleen cookies die nodig zijn om de shop te laten
          werken, tenzij je hieronder akkoord gaat met meer.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => choose("rejected")}>
            Weigeren
          </Button>
          <Button onClick={() => choose("accepted")}>Accepteren</Button>
        </div>
      </div>
    </div>
  );
}
