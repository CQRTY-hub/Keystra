import { prisma } from "@/lib/prisma";
import { classifyCountry } from "@/lib/countries";

/**
 * Confirmed by the storefront owner's accountant (2026-09-01): Keystra
 * invoices without VAT for as long as it stays under BOTH —
 *
 * - total annual turnover under €25,000 (the Belgian small-business VAT
 *   exemption threshold, art. 56bis Btw-Wetboek — see terms.en/nl.ts's
 *   "Prices and VAT" paragraph), and
 * - "foreign" turnover — i.e. sales to customers in *other* EU member
 *   states, Belgium itself doesn't count here — under €10,000 (the
 *   EU-wide micro-business threshold for cross-border B2C digital
 *   services; crossing it means an EU exemption scheme applies instead,
 *   with quarterly per-country reporting — see vat-export.ts).
 *
 * Non-EU sales (customerCountry outside the EU) count toward the total
 * €25,000 threshold but never toward the €10,000 foreign-EU one — that
 * threshold is specifically about intra-EU distance sales.
 *
 * Revenue basis: every order that actually got an Invoice (src/lib/
 * invoicing) — an invoice is only ever issued once payment is confirmed
 * (PLAN.md Phase 3.6), which is the right moment for a turnover
 * threshold regardless of how fulfilment later goes. This does NOT yet
 * net out refunds — credit notes are explicitly out of scope for now
 * (deferred to Phase 3.6 alongside the Accountable export, storefront
 * owner's own instruction, 2026-08-31) — so a refunded order's original
 * invoice amount still counts here until that exists. Worth knowing,
 * not worth blocking this on.
 */

export const TOTAL_THRESHOLD_CENTS = 2_500_000; // €25,000
export const FOREIGN_EU_THRESHOLD_CENTS = 1_000_000; // €10,000
export const WARNING_RATIO = 0.8;

export interface VatThresholdStatus {
  year: number;
  belgiumCents: number;
  otherEuCents: number;
  nonEuCents: number;
  totalCents: number;
  /** belgiumCents + otherEuCents + nonEuCents, always equal to totalCents — kept separate as a sanity check at the call site. */
  foreignEuCents: number;
  totalThresholdCents: number;
  foreignEuThresholdCents: number;
  totalRatio: number;
  foreignEuRatio: number;
  totalWarning: boolean;
  totalExceeded: boolean;
  foreignEuWarning: boolean;
  foreignEuExceeded: boolean;
}

/**
 * Pure — takes the three revenue buckets, returns the full status
 * including the warning/exceeded booleans. Split out from
 * getVatThresholdStatus() below so this can be unit-tested without a
 * database, same reasoning as decideWebhookAction (src/lib/webhooks.ts)
 * and decideRiskHold (src/lib/risk-decision.ts) — see
 * tests/vat-thresholds.test.ts.
 */
export function computeThresholdStatus(
  year: number,
  belgiumCents: number,
  otherEuCents: number,
  nonEuCents: number
): VatThresholdStatus {
  const totalCents = belgiumCents + otherEuCents + nonEuCents;
  const foreignEuCents = otherEuCents;

  const totalRatio = totalCents / TOTAL_THRESHOLD_CENTS;
  const foreignEuRatio = foreignEuCents / FOREIGN_EU_THRESHOLD_CENTS;

  return {
    year,
    belgiumCents,
    otherEuCents,
    nonEuCents,
    totalCents,
    foreignEuCents,
    totalThresholdCents: TOTAL_THRESHOLD_CENTS,
    foreignEuThresholdCents: FOREIGN_EU_THRESHOLD_CENTS,
    totalRatio,
    foreignEuRatio,
    totalWarning: totalRatio >= WARNING_RATIO,
    totalExceeded: totalCents >= TOTAL_THRESHOLD_CENTS,
    foreignEuWarning: foreignEuRatio >= WARNING_RATIO,
    foreignEuExceeded: foreignEuCents >= FOREIGN_EU_THRESHOLD_CENTS,
  };
}

/**
 * Defaults to the current calendar year in UTC. The threshold is a
 * calendar-year figure either way; UTC vs. Europe/Brussels only matters
 * for a handful of hours around New Year's, which isn't worth the
 * added complexity of a timezone library for a number an admin checks
 * periodically, not a real-time gate.
 */
export async function getVatThresholdStatus(year?: number): Promise<VatThresholdStatus> {
  const targetYear = year ?? new Date().getUTCFullYear();
  const startOfYear = new Date(Date.UTC(targetYear, 0, 1));
  const startOfNextYear = new Date(Date.UTC(targetYear + 1, 0, 1));

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: startOfYear, lt: startOfNextYear } },
    select: { order: { select: { totalCents: true, customerCountry: true } } },
  });

  let belgiumCents = 0;
  let otherEuCents = 0;
  let nonEuCents = 0;

  for (const { order } of invoices) {
    const bucket = classifyCountry(order.customerCountry ?? "OTHER");
    if (bucket === "belgium") belgiumCents += order.totalCents;
    else if (bucket === "other_eu") otherEuCents += order.totalCents;
    else nonEuCents += order.totalCents;
  }

  return computeThresholdStatus(targetYear, belgiumCents, otherEuCents, nonEuCents);
}
