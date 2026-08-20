import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { KillSwitchNotice } from "@/components/shop/KillSwitchNotice";
import { isCheckoutEnabled } from "@/lib/kill-switch";
import { getMessages } from "@/i18n";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const t = getMessages();
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
