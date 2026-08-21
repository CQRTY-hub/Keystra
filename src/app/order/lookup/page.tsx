import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/shop/OrderLookupForm";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.trackOrder,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function OrderLookupPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.orderLookup.title}</h1>
      <p className="mt-2 text-slate-700">{t.orderLookup.intro}</p>
      <div className="mt-6">
        <OrderLookupForm />
      </div>
    </div>
  );
}
