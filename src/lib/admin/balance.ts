import { prisma } from "@/lib/prisma";
import { CodesWholesaleProvider } from "@/lib/fulfillment/codeswholesale-provider";

/**
 * PLAN.md Phase 3.5, "Also on the dashboard": "Low supplier balance
 * warning." checkAccountBalance() (GET /v3/accounts/current, already
 * implemented and verified against the sandbox — see
 * codeswholesale-provider.ts) is CodesWholesale-specific, not part of
 * the shared FulfillmentProvider interface, since the mock has no real
 * balance to report — so this reads FULFILLMENT_PROVIDER directly rather
 * than going through getFulfillmentProvider().
 *
 * Called once per admin dashboard load, not polled — PLAN.md's actual
 * polling design (same schedule as syncCatalog) needs the scheduled-job
 * infrastructure that doesn't exist yet (see syncCatalog's own comment
 * in codeswholesale-provider.ts). An admin loading their dashboard is a
 * bounded, human-triggered, infrequent event, not a hot path — the same
 * reasoning that makes checkAvailability() safe to call at checkout time.
 */

export type SupplierBalanceStatus =
  | { available: false; reason: "mock_provider" }
  | { available: false; reason: "error"; message: string }
  | { available: true; balanceCents: number; thresholdCents: number | null; low: boolean };

export async function getSupplierBalanceStatus(): Promise<SupplierBalanceStatus> {
  if ((process.env.FULFILLMENT_PROVIDER ?? "mock") !== "codeswholesale") {
    return { available: false, reason: "mock_provider" };
  }

  let balanceCents: number;
  try {
    const result = await new CodesWholesaleProvider().checkAccountBalance();
    balanceCents = result.balanceCents;
  } catch (err) {
    return {
      available: false,
      reason: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  const settings = await prisma.shopSettings.findUnique({ where: { id: 1 } });
  const thresholdCents = settings?.lowBalanceThresholdCents ?? null;

  return {
    available: true,
    balanceCents,
    thresholdCents,
    low: thresholdCents !== null && balanceCents < thresholdCents,
  };
}

export async function setLowBalanceThreshold(thresholdCents: number | null): Promise<void> {
  await prisma.shopSettings.upsert({
    where: { id: 1 },
    create: { id: 1, lowBalanceThresholdCents: thresholdCents },
    update: { lowBalanceThresholdCents: thresholdCents },
  });
}
