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
    <div>
      <p>
        <span className="font-medium">{t.cookiePreferencesPage.currentStatusLabel}:</span>{" "}
        {statusText}
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => choose("rejected")}
          disabled={saving !== null}
        >
          {t.cookiePreferencesPage.rejectButton}
        </Button>
        <Button onClick={() => choose("accepted")} disabled={saving !== null}>
          {t.cookiePreferencesPage.acceptButton}
        </Button>
      </div>

      <p role="status" className="mt-2 text-sm text-slate-700">
        {justSaved ? t.cookiePreferencesPage.saved : ""}
      </p>
    </div>
  );
}
