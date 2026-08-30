import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import { getPricingRule } from "@/lib/admin/pricing-rule";
import { savePricingRuleAction } from "@/lib/actions/admin-panel-actions";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminPricing,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  await requireAdminSession();

  const rule = await getPricingRule();

  return (
    <div className="max-w-lg">
      <h1 className="text-headline-md text-on-surface">{t.admin.pricing.title}</h1>

      <p className="text-body-md mt-4 rounded-keystra border border-danger p-3 text-on-surface">
        {t.admin.pricing.notAppliedWarning}
      </p>

      <form action={savePricingRuleAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="marginMultiplier" className="text-title-sm text-on-surface">
            {t.admin.pricing.marginMultiplierLabel}
          </label>
          <input
            id="marginMultiplier"
            name="marginMultiplier"
            type="number"
            step="0.01"
            min="0"
            defaultValue={rule?.marginMultiplier ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="minAbsoluteMarginEuros" className="text-title-sm text-on-surface">
            {t.admin.pricing.minAbsoluteMarginLabel}
          </label>
          <input
            id="minAbsoluteMarginEuros"
            name="minAbsoluteMarginEuros"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              rule?.minAbsoluteMarginCents != null
                ? (rule.minAbsoluteMarginCents / 100).toFixed(2)
                : ""
            }
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="priceFloorEuros" className="text-title-sm text-on-surface">
            {t.admin.pricing.priceFloorLabel}
          </label>
          <input
            id="priceFloorEuros"
            name="priceFloorEuros"
            type="number"
            step="0.01"
            min="0"
            defaultValue={rule?.priceFloorCents != null ? (rule.priceFloorCents / 100).toFixed(2) : ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="roundingStyle" className="text-title-sm text-on-surface">
            {t.admin.pricing.roundingStyleLabel}
          </label>
          <input
            id="roundingStyle"
            name="roundingStyle"
            type="text"
            defaultValue={rule?.roundingStyle ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>

        <p className="text-body-md text-secondary">
          {rule?.updatedAt
            ? t.admin.pricing.savedAt(rule.updatedAt.toLocaleString("en-GB"))
            : t.admin.pricing.neverSaved}
        </p>

        <Button type="submit" variant="secondary">
          {t.admin.pricing.save}
        </Button>
      </form>
    </div>
  );
}
