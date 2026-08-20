import { prisma } from "@/lib/prisma";
import type { ProductCategory, ProductSummary } from "@/types/product";

/**
 * Real Prisma-backed queries. See prisma/seed.ts for what's actually
 * seeded (including the fulfillment mock-scenario products, so
 * out-of-stock / timeout / etc. are reachable by clicking through the
 * shop, not just from tests).
 *
 * getProducts() always returns the full active catalogue, unfiltered —
 * the shop page filters (category, region, search) run client-side over
 * that result, same as the category/region filter option lists need to
 * be derived from the full set regardless of what's currently filtered.
 * Fine at Phase 1's catalogue size; revisit if it ever stops being fine.
 */

export async function getProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  return products.map(toSummary);
}

export async function getProductById(id: string): Promise<ProductSummary | null> {
  const product = await prisma.product.findFirst({
    where: { id, active: true },
  });
  return product ? toSummary(product) : null;
}

function toSummary(product: {
  id: string;
  supplierProductId: string;
  title: string;
  category: ProductCategory;
  region: string;
  priceCents: number;
  active: boolean;
}): ProductSummary {
  return {
    id: product.id,
    supplierProductId: product.supplierProductId,
    title: product.title,
    category: product.category,
    region: product.region,
    priceCents: product.priceCents,
    active: product.active,
  };
}
