"use server";

import { revalidatePath } from "next/cache";
import { requireAdminActor } from "@/lib/admin/session";
import { resolveHeldOrder } from "@/lib/admin/orders";
import { setProductActive, refreshProductCost } from "@/lib/admin/products";
import { setLowBalanceThreshold } from "@/lib/admin/balance";
import { savePricingRule, type PricingRuleInput } from "@/lib/admin/pricing-rule";
import { setCheckoutEnabled, setMaintenanceMode } from "@/lib/kill-switch";

/**
 * Every admin mutation in this file starts with requireAdminActor() —
 * Server Actions are independently invocable and don't inherit a page's
 * own session check, so skipping this would mean the action itself has
 * no auth at all. See src/lib/admin/session.ts's own comment on why this
 * is a separate function from the page-level requireAdminSession().
 */

export async function resolveHeldOrderAction(
  orderId: string,
  outcome: "retry" | "refund",
  formData: FormData
): Promise<void> {
  const actor = await requireAdminActor();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  await resolveHeldOrder(orderId, outcome, actor, note);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function toggleProductActiveAction(
  productId: string,
  nextActive: boolean
): Promise<void> {
  const actor = await requireAdminActor();
  await setProductActive(productId, nextActive, actor);
  revalidatePath("/admin/products");
}

export async function refreshProductCostAction(productId: string): Promise<void> {
  const actor = await requireAdminActor();
  await refreshProductCost(productId, actor);
  revalidatePath("/admin/products");
}

export async function setCheckoutEnabledAction(
  enabled: boolean,
  formData: FormData
): Promise<void> {
  const actor = await requireAdminActor();
  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  await setCheckoutEnabled(enabled, actor, reason);
  revalidatePath("/admin/kill-switch");
  revalidatePath("/admin");
}

export async function setMaintenanceModeAction(
  enabled: boolean,
  formData: FormData
): Promise<void> {
  const actor = await requireAdminActor();
  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  await setMaintenanceMode(enabled, actor, reason);
  revalidatePath("/admin/kill-switch");
  revalidatePath("/admin");
}

export async function setLowBalanceThresholdAction(formData: FormData): Promise<void> {
  await requireAdminActor();
  const raw = String(formData.get("thresholdEuros") ?? "").trim();
  const thresholdCents = raw === "" ? null : Math.round(Number.parseFloat(raw) * 100);
  await setLowBalanceThreshold(
    thresholdCents !== null && Number.isFinite(thresholdCents) ? thresholdCents : null
  );
  revalidatePath("/admin");
}

export async function savePricingRuleAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor();

  const parseFloatOrNull = (value: FormDataEntryValue | null): number | null => {
    const s = String(value ?? "").trim();
    if (s === "") return null;
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };
  const parseCentsOrNull = (value: FormDataEntryValue | null): number | null => {
    const euros = parseFloatOrNull(value);
    return euros === null ? null : Math.round(euros * 100);
  };

  const input: PricingRuleInput = {
    marginMultiplier: parseFloatOrNull(formData.get("marginMultiplier")),
    minAbsoluteMarginCents: parseCentsOrNull(formData.get("minAbsoluteMarginEuros")),
    priceFloorCents: parseCentsOrNull(formData.get("priceFloorEuros")),
    roundingStyle: String(formData.get("roundingStyle") ?? "").trim() || null,
  };

  await savePricingRule(input, actor);
  revalidatePath("/admin/pricing");
}
