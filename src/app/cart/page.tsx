import Link from "next/link";
import { CartSummary } from "@/components/shop/CartSummary";

// Can contain cart state that's specific to this visitor — never cache.
export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Winkelmandje</h1>
      <div className="mt-6">
        <CartSummary />
      </div>
      <div className="mt-6">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Naar afrekenen
        </Link>
      </div>
    </div>
  );
}
