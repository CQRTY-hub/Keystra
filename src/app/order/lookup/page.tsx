import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/shop/OrderLookupForm";
import { PageTitleBand } from "@/components/PageTitleBand";
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
      <PageTitleBand title={t.orderLookup.title} />
      <p className="text-body-md mt-4 text-secondary">{t.orderLookup.intro}</p>
      <div className="mt-6">
        <OrderLookupForm />
      </div>
    </div>
  );
}
