"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CookieConsentValue } from "@/lib/consent-text";
import { readCookieConsentFromDocument } from "@/lib/consent-client";
import { recordCookieConsent } from "@/lib/actions/consent-actions";
import { getMessages } from "@/i18n";

/**
 * Nothing non-essential fires before a visible choice is made here, and
 * rejecting is exactly as easy as accepting — one button each, same
 * size, same step. See PLAN.md Phase 1 point 7 and Appendix item 2.
 * Withdrawing later is /cookie-preferences (linked from the footer),
 * same recordCookieConsent() action, same ease.
 *
 * No analytics or other optional script exists anywhere in the app yet.
 * When one is added, it must be gated behind an "accepted" read of
 * getCookieConsent() (server) or this component's state (client) — never
 * added unconditionally.
 */
export function CookieConsent() {
  const t = getMessages();
  const [choice, setChoice] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(readCookieConsentFromDocument());
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
      aria-label={t.cookieConsent.dialogLabel}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline bg-container p-gutter"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-md text-on-surface">{t.cookieConsent.body}</p>
        <div className="flex gap-2">
          {/* Neither choice is a buy action — both stay "secondary" so
              rejecting reads as exactly as easy as accepting, not dimmer. */}
          <Button variant="secondary" onClick={() => choose("rejected")}>
            {t.cookieConsent.reject}
          </Button>
          <Button variant="secondary" onClick={() => choose("accepted")}>
            {t.cookieConsent.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
