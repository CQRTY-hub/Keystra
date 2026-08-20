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
      className="rounded border border-slate-300 bg-slate-50 p-4 text-slate-900"
    >
      <p className="font-medium">{t.killSwitch.title}</p>
      <p className="mt-1 text-sm">
        {t.killSwitch.bodyPrefix}
        <a href="/order/lookup" className="underline">
          {t.killSwitch.lookupLink}
        </a>
        {t.killSwitch.bodySuffix}
      </p>
    </div>
  );
}
