/** Prices are stored in cents everywhere (see prisma/schema.prisma) to avoid float rounding. */
export function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/**
 * Mollie's Payments API wants amounts as a decimal string with exactly two
 * places (e.g. "10.00", not 1000) — see src/lib/payments/mollie-provider.ts.
 * Plain division would reintroduce the float-rounding problem cents
 * everywhere else in this codebase exists to avoid, so this does the
 * cents/euros split with integer arithmetic instead.
 */
export function centsToDecimalString(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${euros}.${remainder}`;
}
