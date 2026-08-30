import { getMessages } from "@/i18n";

/**
 * Shown wherever checkout would otherwise be offered, when the kill
 * switch (src/lib/kill-switch.ts) is off. Deliberately plain and honest —
 * no vague error, no dead end. Full admin controls arrive in Phase 3.5;
 * this component just needs to exist and tell the truth.
 */
export function KillSwitchNotice() {
  const t = getMessages();

  return (
    <div
      role="status"
      className="rounded-keystra border border-outline bg-container p-4 text-on-surface"
    >
      <p className="text-title-sm">{t.killSwitch.title}</p>
      <p className="text-body-md mt-1 text-secondary">
        {t.killSwitch.bodyPrefix}
        <a href="/order/lookup" className="text-secondary underline hover:text-primary">
          {t.killSwitch.lookupLink}
        </a>
        {t.killSwitch.bodySuffix}
      </p>
    </div>
  );
}
