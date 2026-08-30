import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import {
  setCheckoutEnabledAction,
  setMaintenanceModeAction,
  setLowBalanceThresholdAction,
} from "@/lib/actions/admin-panel-actions";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminKillSwitch,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminKillSwitchPage() {
  await requireAdminSession();

  const settings = await prisma.shopSettings.findUnique({ where: { id: 1 } });
  const checkoutEnabled = settings?.checkoutEnabled ?? true;
  const maintenanceMode = settings?.maintenanceMode ?? false;

  const pauseCheckout = setCheckoutEnabledAction.bind(null, false);
  const resumeCheckout = setCheckoutEnabledAction.bind(null, true);
  const enableMaintenance = setMaintenanceModeAction.bind(null, true);
  const disableMaintenance = setMaintenanceModeAction.bind(null, false);

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-md text-on-surface">{t.admin.killSwitch.title}</h1>
      <p className="text-body-md mt-2 text-secondary">{t.admin.killSwitch.intro}</p>

      {/* Level 1 */}
      <section className="mt-8 rounded-keystra border border-outline bg-container p-4">
        <h2 className="text-title-sm text-on-surface">{t.admin.killSwitch.level1Title}</h2>
        <p className="text-body-md mt-2 text-secondary">{t.admin.killSwitch.level1Body}</p>
        <Link
          href="/admin/products"
          className="text-body-md mt-3 inline-block text-secondary underline hover:text-primary"
        >
          {t.admin.killSwitch.level1Link} →
        </Link>
      </section>

      {/* Level 2 */}
      <section className="mt-4 rounded-keystra border border-outline bg-container p-4">
        <h2 className="text-title-sm text-on-surface">{t.admin.killSwitch.level2Title}</h2>
        <p className="text-body-md mt-2 text-secondary">{t.admin.killSwitch.level2Body}</p>
        <p className="text-body-md mt-3 text-on-surface">
          {checkoutEnabled
            ? t.admin.killSwitch.level2CurrentlyOpen
            : t.admin.killSwitch.level2CurrentlyPaused(
                settings?.checkoutPausedBy ?? "?",
                settings?.checkoutPausedAt?.toLocaleString("en-GB") ?? "?"
              )}
        </p>
        <form action={checkoutEnabled ? pauseCheckout : resumeCheckout} className="mt-3">
          {checkoutEnabled && (
            <div className="mb-3 flex flex-col gap-1">
              <label htmlFor="checkout-reason" className="text-title-sm text-on-surface">
                {t.admin.killSwitch.reasonLabel}
              </label>
              <input
                id="checkout-reason"
                name="reason"
                className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
              />
            </div>
          )}
          <Button type="submit" variant="secondary">
            {checkoutEnabled ? t.admin.killSwitch.level2Pause : t.admin.killSwitch.level2Resume}
          </Button>
        </form>
      </section>

      {/* Level 3 */}
      <section className="mt-4 rounded-keystra border border-danger p-4">
        <h2 className="text-title-sm text-on-surface">{t.admin.killSwitch.level3Title}</h2>
        <p className="text-body-md mt-2 text-secondary">{t.admin.killSwitch.level3Body}</p>
        <p className="text-body-md mt-3 text-on-surface">
          {maintenanceMode
            ? t.admin.killSwitch.level3CurrentlyOn(
                settings?.maintenanceModeEnabledBy ?? "?",
                settings?.maintenanceModeEnabledAt?.toLocaleString("en-GB") ?? "?"
              )
            : t.admin.killSwitch.level3CurrentlyOff}
        </p>
        <form action={maintenanceMode ? disableMaintenance : enableMaintenance} className="mt-3">
          {!maintenanceMode && (
            <div className="mb-3 flex flex-col gap-1">
              <label htmlFor="maintenance-reason" className="text-title-sm text-on-surface">
                {t.admin.killSwitch.reasonLabel}
              </label>
              <input
                id="maintenance-reason"
                name="reason"
                className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
              />
            </div>
          )}
          <Button type="submit" variant="secondary">
            {maintenanceMode ? t.admin.killSwitch.level3Disable : t.admin.killSwitch.level3Enable}
          </Button>
        </form>
      </section>

      {/* Balance threshold */}
      <section className="mt-4 rounded-keystra border border-outline bg-container p-4">
        <h2 className="text-title-sm text-on-surface">{t.admin.killSwitch.balanceThresholdTitle}</h2>
        <form action={setLowBalanceThresholdAction} className="mt-3 flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="threshold" className="text-title-sm text-on-surface">
              {t.admin.killSwitch.balanceThresholdLabel}
            </label>
            <input
              id="threshold"
              name="thresholdEuros"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                settings?.lowBalanceThresholdCents != null
                  ? (settings.lowBalanceThresholdCents / 100).toFixed(2)
                  : ""
              }
              className="text-body-md w-40 rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
            />
          </div>
          <Button type="submit" variant="secondary">
            {t.admin.killSwitch.balanceThresholdSave}
          </Button>
        </form>
      </section>
    </div>
  );
}
