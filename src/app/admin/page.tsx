import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { adminLogout } from "@/lib/actions/admin-auth-actions";
import { getSupplierBalanceStatus } from "@/lib/admin/balance";
import { getVatThresholdStatus } from "@/lib/vat-thresholds";
import { formatPriceCents } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.admin,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/orders", label: t.admin.dashboard.nav.orders },
  { href: "/admin/products", label: t.admin.dashboard.nav.products },
  { href: "/admin/kill-switch", label: t.admin.dashboard.nav.killSwitch },
  { href: "/admin/pricing", label: t.admin.dashboard.nav.pricing },
  { href: "/admin/vat", label: t.admin.dashboard.nav.vat },
];

export default async function AdminHomePage() {
  // Redirects to /admin/login if there's no valid session — every
  // protected admin page starts with this line.
  await requireAdminSession();

  const credential = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  const balance = await getSupplierBalanceStatus();
  const vat = await getVatThresholdStatus();
  const vatExceeded = vat.totalExceeded || vat.foreignEuExceeded;
  const vatWarning = vat.totalWarning || vat.foreignEuWarning;

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-headline-md text-on-surface">{t.admin.dashboard.title}</h1>
      {credential && (
        <p className="text-body-md mt-2 text-secondary">
          {t.admin.dashboard.loggedInAs(credential.email)}
        </p>
      )}

      <div className="mt-6 rounded-keystra border border-outline bg-container p-4">
        <p className="text-label-caps text-secondary">{t.admin.dashboard.balance.title}</p>
        <p className="text-body-md mt-1 text-on-surface">
          {balance.available === false && balance.reason === "mock_provider" && t.admin.dashboard.balance.mockProvider}
          {balance.available === false && balance.reason === "error" && t.admin.dashboard.balance.error}
          {balance.available && (
            <>
              <span className={balance.low ? "text-danger" : ""}>
                {balance.low
                  ? t.admin.dashboard.balance.low(formatPriceCents(balance.balanceCents))
                  : t.admin.dashboard.balance.ok(formatPriceCents(balance.balanceCents))}
              </span>
              {balance.thresholdCents === null && (
                <span className="text-secondary"> {t.admin.dashboard.balance.noThreshold}</span>
              )}
            </>
          )}
        </p>
      </div>

      <Link
        href="/admin/vat"
        className="mt-4 flex items-center justify-between rounded-keystra border border-outline bg-container p-4 hover:border-secondary"
      >
        <span className="text-label-caps text-secondary">{t.admin.dashboard.vatSummary.title}</span>
        <span
          className={`text-title-sm ${vatExceeded || vatWarning ? "text-danger" : "text-on-surface"}`}
        >
          {vatExceeded
            ? t.admin.dashboard.vatSummary.exceededBadge
            : vatWarning
              ? t.admin.dashboard.vatSummary.warningBadge
              : t.admin.dashboard.vatSummary.okBadge}
        </span>
      </Link>

      <nav aria-label={t.admin.dashboard.title} className="mt-6 flex flex-col gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-title-sm rounded-keystra border border-outline bg-container px-4 py-3 text-on-surface hover:border-secondary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <form action={adminLogout} className="mt-6">
        <Button type="submit" variant="secondary">
          {t.admin.dashboard.logout}
        </Button>
      </form>
    </div>
  );
}
