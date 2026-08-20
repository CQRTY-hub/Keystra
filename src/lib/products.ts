import type { ProductSummary } from "@/types/product";

/**
 * TEMPORARY. No Supabase database is connected yet (that's the next
 * checkpoint after this one — see README.md). This returns fixed sample
 * data so the shop, product, and home pages have something real to
 * render on localhost. The function signatures match what the Prisma
 * versions will look like, so swapping this out is a small, contained
 * change — not a rewrite of every page that calls these.
 *
 * Do not add real product data here. Once Supabase exists, this file is
 * replaced by `prisma.product.findMany()` / `findUnique()` calls.
 */

const SAMPLE_PRODUCTS: ProductSummary[] = [
  {
    id: "sample-1",
    supplierProductId: "11111111-1111-4111-a111-111111111111",
    title: "Sample Adventure Game — Standard Edition",
    platform: "Steam",
    region: "EU",
    priceCents: 3999,
    active: true,
  },
  {
    id: "sample-2",
    supplierProductId: "22222222-2222-4222-a222-222222222222",
    title: "Sample Racing Game — Deluxe Edition",
    platform: "PlayStation",
    region: "EU",
    priceCents: 5999,
    active: true,
  },
  {
    id: "sample-3",
    supplierProductId: "33333333-3333-4333-a333-333333333333",
    title: "Sample Strategy Game",
    platform: "Xbox",
    region: "Global",
    priceCents: 2499,
    active: true,
  },
  {
    id: "sample-4",
    supplierProductId: "44444444-4444-4444-a444-444444444444",
    title: "Sample Delisted Title",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
    active: false,
  },
];

export async function getProducts(): Promise<ProductSummary[]> {
  return SAMPLE_PRODUCTS.filter((p) => p.active);
}

export async function getProductById(id: string): Promise<ProductSummary | null> {
  return SAMPLE_PRODUCTS.find((p) => p.id === id && p.active) ?? null;
}
