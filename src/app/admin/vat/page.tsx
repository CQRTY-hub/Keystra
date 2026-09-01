import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { getVatThresholdStatus } from "@/lib/vat-thresholds";
import { formatPriceCents } from "@/lib/currency";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminVat,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const CURRENT_YEAR = new Date().getUTCFullYear();
// A handful of quarters back — enough to export what's already closed
// without a date picker that has to handle "before the shop existed."
const EXPORT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1];

function statusLabel(warning: boolean, exceeded: boolean): string {
  if (exceeded) return t.admin.vat.statusExceeded;
  if (warning) return t.admin.vat.statusWarning;
  return t.admin.vat.statusOk;
}

function statusClass(warning: boolean, exceeded: boolean): string {
  if (exceeded) return "text-danger";
  if (warning) return "text-danger";
  return "text-on-surface";
}

export default async function AdminVatPage() {
  await requireAdminSession();

  const status = await getVatThresholdStatus();

  return (
    <div className="max-w-lg">
      <Link href="/admin" className="text-body-md text-secondary hover:text-primary">
        ← {t.admin.dashboard.title}
      </Link>

      <h1 className="text-headline-md mt-2 text-on-surface">{t.admin.vat.title}</h1>
      <p className="text-body-md mt-2 text-secondary">{t.admin.vat.intro}</p>
      <p className="text-label-caps mt-4 text-secondary">{t.admin.vat.yearLabel(status.year)}</p>

      <section className="mt-4 flex flex-col gap-4">
        <div className="rounded-keystra border border-outline bg-container p-4">
          <p className="text-title-sm text-on-surface">{t.admin.vat.totalTitle}</p>
          <p className={`text-headline-md mt-1 ${statusClass(status.totalWarning, status.totalExceeded)}`}>
            {t.admin.vat.ofThreshold(
              formatPriceCents(status.totalCents),
              formatPriceCents(status.totalThresholdCents)
            )}
          </p>
          <p className={`text-body-md mt-1 ${statusClass(status.totalWarning, status.totalExceeded)}`}>
            {statusLabel(status.totalWarning, status.totalExceeded)}
          </p>
        </div>

        <div className="rounded-keystra border border-outline bg-container p-4">
          <p className="text-title-sm text-on-surface">{t.admin.vat.foreignEuTitle}</p>
          <p
            className={`text-headline-md mt-1 ${statusClass(status.foreignEuWarning, status.foreignEuExceeded)}`}
          >
            {t.admin.vat.ofThreshold(
              formatPriceCents(status.foreignEuCents),
              formatPriceCents(status.foreignEuThresholdCents)
            )}
          </p>
          <p
            className={`text-body-md mt-1 ${statusClass(status.foreignEuWarning, status.foreignEuExceeded)}`}
          >
            {statusLabel(status.foreignEuWarning, status.foreignEuExceeded)}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-title-sm text-on-surface">{t.admin.vat.breakdownTitle}</h2>
        <dl className="mt-2 flex flex-col gap-1 text-body-md">
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">{t.admin.vat.belgium}</dt>
            <dd className="tabular-nums text-on-surface">{formatPriceCents(status.belgiumCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">{t.admin.vat.otherEu}</dt>
            <dd className="tabular-nums text-on-surface">{formatPriceCents(status.otherEuCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">{t.admin.vat.nonEu}</dt>
            <dd className="tabular-nums text-on-surface">{formatPriceCents(status.nonEuCents)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-title-sm text-on-surface">{t.admin.vat.exportTitle}</h2>
        <p className="text-body-md mt-1 text-secondary">{t.admin.vat.exportHint}</p>

        <form action="/api/admin/vat-export" method="GET" className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="vat-export-year" className="text-title-sm text-on-surface">
              {t.admin.vat.exportYearLabel}
            </label>
            <select
              id="vat-export-year"
              name="year"
              defaultValue={CURRENT_YEAR}
              className="rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-body-md text-on-surface"
            >
              {EXPORT_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="vat-export-quarter" className="text-title-sm text-on-surface">
              {t.admin.vat.exportQuarterLabel}
            </label>
            <select
              id="vat-export-quarter"
              name="quarter"
              defaultValue={Math.ceil((new Date().getUTCMonth() + 1) / 3)}
              className="rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-body-md text-on-surface"
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>

          <button
            type="submit"
            className="text-title-sm rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
          >
            {t.admin.vat.exportButton}
          </button>
        </form>
      </section>
    </div>
  );
}
