import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { getFulfillmentProvider } from "@/lib/fulfillment";

/**
 * PLAN.md Phase 3.5, "Also on the dashboard": "Products list with cost,
 * price, margin, and active toggle." `active` here IS the noodknop's
 * Level 1 ("pause a product") — see prisma/schema.prisma's comment on
 * Product.active.
 */

export async function listProductsForAdmin() {
  return prisma.product.findMany({ orderBy: { title: "asc" } });
}

export async function setProductActive(
  productId: string,
  active: boolean,
  actor: string
): Promise<void> {
  const before = await prisma.product.findUnique({ where: { id: productId } });
  if (!before) throw new Error(`Product ${productId} not found.`);

  await prisma.product.update({ where: { id: productId }, data: { active } });

  await logEvent({
    eventType: "admin.product_active_changed",
    payload: {
      productId,
      title: before.title,
      before: before.active,
      after: active,
      actor,
    },
  });
}

/**
 * Refreshes Product.costCentsSnapshot from the supplier — on demand,
 * one product at a time, only when an admin clicks the button. Never
 * called automatically or in a loop across the catalogue: PLAN.md is
 * explicit that checkAvailability() is only for checkout or an explicit
 * single lookup, never a page view, and the real provider's rate limit
 * for this endpoint (600 requests / 5 min for ONE product, per
 * codeswholesale-provider.ts) is sized for exactly that usage pattern,
 * not a bulk sync.
 */
export async function refreshProductCost(productId: string, actor: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error(`Product ${productId} not found.`);

  const availability = await getFulfillmentProvider().checkAvailability(
    product.supplierProductId
  );

  await prisma.product.update({
    where: { id: productId },
    data: {
      costCentsSnapshot: availability.priceCents,
      costSnapshotAt: new Date(),
    },
  });

  await logEvent({
    eventType: "admin.product_cost_refreshed",
    payload: {
      productId,
      title: product.title,
      before: product.costCentsSnapshot,
      after: availability.priceCents,
      actor,
    },
  });
}
