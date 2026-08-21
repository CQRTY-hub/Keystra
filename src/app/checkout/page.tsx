import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { KillSwitchNotice } from "@/components/shop/KillSwitchNotice";
import { isCheckoutEnabled } from "@/lib/kill-switch";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.checkout,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const checkoutEnabled = await isCheckoutEnabled();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.checkout.title}</h1>
      <div className="mt-6">
        {checkoutEnabled ? <CheckoutForm /> : <KillSwitchNotice />}
      </div>
    </div>
  );
}
