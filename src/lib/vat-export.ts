import { prisma } from "@/lib/prisma";
import { countryDisplayName } from "@/lib/countries";

export interface QuarterlyCountryRevenue {
  countryCode: string;
  countryName: string;
  orderCount: number;
  revenueCents: number;
}

export interface QuarterlyVatExport {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  rows: QuarterlyCountryRevenue[];
  totalCents: number;
}

function quarterRange(year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
  return {
    start: new Date(Date.UTC(year, startMonth, 1)),
    end: new Date(Date.UTC(year, startMonth + 3, 1)),
  };
}

/**
 * Per-country revenue for one quarter, from issued invoices (same
 * revenue basis as vat-thresholds.ts — see that file's own comment on
 * why: invoiced, not merely ordered or fulfilled). This is the data;
 * see toCsv() below for the one place that turns it into a downloadable
 * file, kept deliberately separate so the actual delivery format can
 * change without touching this query.
 */
export async function getQuarterlyVatExport(
  year: number,
  quarter: 1 | 2 | 3 | 4
): Promise<QuarterlyVatExport> {
  const { start, end } = quarterRange(year, quarter);

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: start, lt: end } },
    select: { order: { select: { totalCents: true, customerCountry: true } } },
  });

  const byCountry = new Map<string, { orderCount: number; revenueCents: number }>();
  for (const { order } of invoices) {
    const code = order.customerCountry ?? "OTHER";
    const existing = byCountry.get(code) ?? { orderCount: 0, revenueCents: 0 };
    existing.orderCount += 1;
    existing.revenueCents += order.totalCents;
    byCountry.set(code, existing);
  }

  const rows: QuarterlyCountryRevenue[] = Array.from(byCountry.entries())
    .map(([countryCode, v]) => ({
      countryCode,
      countryName: countryDisplayName(countryCode),
      orderCount: v.orderCount,
      revenueCents: v.revenueCents,
    }))
    // Highest revenue first — what the accountant will want to glance
    // at first is almost always "which country moved the needle."
    .sort((a, b) => b.revenueCents - a.revenueCents);

  const totalCents = rows.reduce((sum, r) => sum + r.revenueCents, 0);

  return { year, quarter, rows, totalCents };
}

/**
 * Deliberately the ONE place that decides the delivered file's columns
 * and formatting (storefront owner: "het exacte formaat volgt nog van
 * mijn boekhouder; maak het makkelijk aanpasbaar"). When that format
 * lands, change the `header` array and the one `row.map(...)` line
 * below — nothing else in the export pipeline (the query above, the
 * download route) needs to know or care.
 *
 * Amounts are in whole euros with a decimal point (e.g. "39.99"), not
 * cents — the common expectation for a bookkeeping import. No currency
 * symbol, since that trips up most spreadsheet/accounting CSV imports.
 */
export function toCsv(data: QuarterlyVatExport): string {
  const header = ["Country code", "Country", "Orders", "Revenue (EUR)"];
  const lines = [header.join(",")];

  for (const row of data.rows) {
    const revenue = (row.revenueCents / 100).toFixed(2);
    lines.push(
      [
        row.countryCode,
        csvEscape(row.countryName),
        String(row.orderCount),
        revenue,
      ].join(",")
    );
  }

  lines.push(["", "Total", "", (data.totalCents / 100).toFixed(2)].join(","));

  return lines.join("\r\n");
}

function csvEscape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
