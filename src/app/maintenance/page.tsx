import type { Metadata } from "next";
import Link from "next/link";
import { PageTitleBand } from "@/components/PageTitleBand";
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
const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.maintenance,
  robots: { index: false, follow: false },
};
export const revalidate = 3600;

export default function MaintenancePage() {
  return (
    <div>
      <PageTitleBand title={t.maintenance.title} />
      <p className="text-body-md mt-4 text-secondary">{t.maintenance.body}</p>
      <Link
        href="/order/lookup"
        className="mt-6 inline-flex items-center text-secondary underline hover:text-primary"
      >
        {t.maintenance.lookupLink}
      </Link>
    </div>
  );
}
