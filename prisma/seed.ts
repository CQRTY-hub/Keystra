import { PrismaClient } from "@prisma/client";
import { MOCK_SCENARIO_PRODUCT_IDS } from "../src/lib/fulfillment/mock-provider";

const prisma = new PrismaClient();

/**
 * Idempotent — safe to run more than once. Uses upsert on
 * supplierProductId (the unique, stable identifier — never the title),
 * so re-running this never creates duplicates and never touches the
 * kill switch once it's been set.
 */

const SAMPLE_PRODUCTS = [
  {
    supplierProductId: "11111111-1111-4111-a111-111111111111",
    title: "Sample Adventure Game — Standard Edition",
    platform: "Steam",
    region: "EU",
    priceCents: 3999,
  },
  {
    supplierProductId: "22222222-2222-4222-a222-222222222222",
    title: "Sample Racing Game — Deluxe Edition",
    platform: "PlayStation",
    region: "EU",
    priceCents: 5999,
  },
  {
    supplierProductId: "33333333-3333-4333-a333-333333333333",
    title: "Sample Strategy Game",
    platform: "Xbox",
    region: "Global",
    priceCents: 2499,
  },
  // The fulfillment mock-scenario products — same IDs the tests use, so
  // every failure path (out of stock, empty balance, timeout, image key,
  // awaiting_code) can also be clicked through in the running app, not
  // just exercised in tests/fulfillment.test.ts.
  {
    supplierProductId: MOCK_SCENARIO_PRODUCT_IDS.outOfStock,
    title: "[QA] Out of stock scenario",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
  },
  {
    supplierProductId: MOCK_SCENARIO_PRODUCT_IDS.emptyBalance,
    title: "[QA] Empty supplier balance scenario",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
  },
  {
    supplierProductId: MOCK_SCENARIO_PRODUCT_IDS.timeout,
    title: "[QA] Supplier timeout scenario",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
  },
  {
    supplierProductId: MOCK_SCENARIO_PRODUCT_IDS.imageKey,
    title: "[QA] Image-delivered key scenario",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
  },
  {
    supplierProductId: MOCK_SCENARIO_PRODUCT_IDS.awaitingCode,
    title: "[QA] Awaiting-code (preorder) scenario",
    platform: "Steam",
    region: "EU",
    priceCents: 1999,
  },
];

async function seedProducts() {
  for (const product of SAMPLE_PRODUCTS) {
    await prisma.product.upsert({
      where: { supplierProductId: product.supplierProductId },
      create: product,
      update: product,
    });
  }
  console.log(`Seeded ${SAMPLE_PRODUCTS.length} products.`);
}

async function seedShopSettings() {
  const existing = await prisma.shopSettings.findUnique({ where: { id: 1 } });

  if (existing) {
    console.log(
      `ShopSettings already exists (checkoutEnabled: ${existing.checkoutEnabled}) — leaving it as is.`
    );
    return;
  }

  await prisma.shopSettings.create({
    data: { id: 1, checkoutEnabled: true },
  });
  console.log("Created ShopSettings row with checkoutEnabled: true.");
}

async function main() {
  await seedProducts();
  await seedShopSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
