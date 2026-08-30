"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CookieConsentValue } from "@/lib/consent-text";
import { recordCookieConsent } from "@/lib/actions/consent-actions";
import { getMessages } from "@/i18n";

/**
 * PLAN.md, "Pages needed": withdrawing consent must be exactly as easy
 * as giving it. Same recordCookieConsent() action the banner uses, same
 * one-click accept/reject — the only difference is this is a page you
 * can come back to, instead of a one-time prompt.
 */
export function CookiePreferencesForm({
  initialStatus,
}: {
  initialStatus: CookieConsentValue | null;
}) {
  const t = getMessages();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState<CookieConsentValue | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  async function choose(value: CookieConsentValue) {
    setSaving(value);
    setJustSaved(false);
    try {
      await recordCookieConsent(value);
      setStatus(value);
      setJustSaved(true);
    } finally {
      setSaving(null);
    }
  }

  const statusText =
    status === "accepted"
      ? t.cookiePreferencesPage.statusAccepted
      : status === "rejected"
        ? t.cookiePreferencesPage.statusRejected
        : t.cookiePreferencesPage.statusNotSet;

  return (
    <div className="text-body-md text-on-surface">
      <p>
        <span className="text-title-sm">{t.cookiePreferencesPage.currentStatusLabel}:</span>{" "}
        {statusText}
      </p>

      <div className="mt-4 flex gap-2">
        {/* Neither choice is a buy action — both "secondary", same as the
            banner, so rejecting reads as exactly as easy as accepting. */}
        <Button
          variant="secondary"
          onClick={() => choose("rejected")}
          disabled={saving !== null}
        >
          {t.cookiePreferencesPage.rejectButton}
        </Button>
        <Button
          variant="secondary"
          onClick={() => choose("accepted")}
          disabled={saving !== null}
        >
          {t.cookiePreferencesPage.acceptButton}
        </Button>
      </div>

      <p role="status" className="text-body-md mt-2 text-secondary">
        {justSaved ? t.cookiePreferencesPage.saved : ""}
      </p>
    </div>
  );
}
