import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";

/**
 * PLAN.md Phase 3.5, "Pricing — a rule, not 500 numbers." Storage only —
 * explicitly not yet: no repricing run, no margin guard, no per-product
 * override, nothing here ever changes a Product.priceCents. The
 * storefront owner hasn't finalized the margin decision and is waiting
 * on their accountant re: VAT position (their words). This exists so the
 * screen and the values are ready the moment that decision is made,
 * without a second migration then.
 */

export interface PricingRuleInput {
  marginMultiplier: number | null;
  minAbsoluteMarginCents: number | null;
  priceFloorCents: number | null;
  roundingStyle: string | null;
}

export async function getPricingRule() {
  return prisma.pricingRule.findUnique({ where: { id: 1 } });
}

export async function savePricingRule(input: PricingRuleInput, actor: string): Promise<void> {
  const before = await prisma.pricingRule.findUnique({ where: { id: 1 } });

  const after = await prisma.pricingRule.upsert({
    where: { id: 1 },
    create: { id: 1, ...input },
    update: { ...input },
  });

  await logEvent({
    eventType: "admin.pricing_rule_updated",
    payload: {
      before: before
        ? {
            marginMultiplier: before.marginMultiplier,
            minAbsoluteMarginCents: before.minAbsoluteMarginCents,
            priceFloorCents: before.priceFloorCents,
            roundingStyle: before.roundingStyle,
          }
        : null,
      after: {
        marginMultiplier: after.marginMultiplier,
        minAbsoluteMarginCents: after.minAbsoluteMarginCents,
        priceFloorCents: after.priceFloorCents,
        roundingStyle: after.roundingStyle,
      },
      actor,
    },
  });
}
