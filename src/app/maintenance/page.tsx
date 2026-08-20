import type { Metadata } from "next";
import Link from "next/link";
import { getMessages } from "@/i18n";

/**
 * PLAN.md, "Pages needed": the page for level 3 of the kill switch (full
 * maintenance). This is the PAGE only — the 3-level kill switch itself,
 * and the middleware that would actually route every request here, are
 * Phase 3.5 work ("the admin controls come in Phase 3.5"). Right now
 * ShopSettings only has the one checkoutEnabled flag; this route exists
 * so there's somewhere to point once that gating is built.
 *
 * Order lookup keeps working at every kill-switch level, including full
 * maintenance (PLAN.md, Phase 3.5) — hence the link stays here too.
 */
export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};
export const revalidate = 3600;

export default function MaintenancePage() {
  const t = getMessages();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.maintenance.title}</h1>
      <p className="mt-2 text-slate-700">{t.maintenance.body}</p>
      <Link href="/order/lookup" className="mt-6 inline-flex items-center underline">
        {t.maintenance.lookupLink}
      </Link>
    </div>
  );
}
