/** Prices are stored in cents everywhere (see prisma/schema.prisma) to avoid float rounding. */
export function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
