import Link from "next/link";
import { CartSummary } from "@/components/shop/CartSummary";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

// Can contain cart state that's specific to this visitor — never cache.
export const dynamic = "force-dynamic";

export default function CartPage() {
  const t = getMessages();

  return (
    <div>
      <PageTitleBand title={t.cart.title} />
      <div className="mt-6">
        <CartSummary />
      </div>
      <div className="mt-6">
        {/* Proceeding to checkout isn't itself the buy action (paying is,
            on the checkout page) — stays secondary, same as elsewhere. */}
        <Link
          href="/checkout"
          className="text-title-sm inline-flex items-center justify-center rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
        >
          {t.cart.goToCheckout}
        </Link>
      </div>
    </div>
  );
}
