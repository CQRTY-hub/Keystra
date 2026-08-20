import { prisma } from "@/lib/prisma";
import type { ProductSummary } from "@/types/product";

/**
 * Real Prisma-backed queries. Replaces the temporary in-memory sample
 * data that existed before Supabase was connected — see prisma/seed.ts
 * for what's actually seeded (including the fulfillment mock-scenario
 * products, so out-of-stock / timeout / etc. are reachable by clicking
 * through the shop, not just from tests).
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
  platform: string;
  region: string;
  priceCents: number;
  active: boolean;
}): ProductSummary {
  return {
    id: product.id,
    supplierProductId: product.supplierProductId,
    title: product.title,
    platform: product.platform,
    region: product.region,
    priceCents: product.priceCents,
    active: product.active,
  };
}
