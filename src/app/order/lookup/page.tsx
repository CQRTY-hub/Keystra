import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/shop/OrderLookupForm";

export const metadata: Metadata = {
  title: "Bestelling opzoeken",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function OrderLookupPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Bestelling opzoeken</h1>
      <p className="mt-2 text-slate-700">
        Vul je bestelnummer en e-mailadres in. Je hebt geen account nodig.
      </p>
      <div className="mt-6">
        <OrderLookupForm />
      </div>
    </div>
  );
}
