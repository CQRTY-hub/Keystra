"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { getMessages } from "@/i18n";

/**
 * The cart icon in the header, plus the item-count badge — split out as
 * its own client component because the count only exists client-side
 * (cart-context.tsx is localStorage-backed), while the rest of the header
 * in layout.tsx is a server component. Without this, "add to cart" gave
 * no visible confirmation that anything happened.
 */
export function HeaderCartLink() {
  const { itemCount } = useCart();
  const t = getMessages();

  return (
    <Link
      href="/cart"
      aria-label={itemCount > 0 ? t.nav.cartWithCount(itemCount) : t.nav.cart}
      className="relative flex h-11 w-11 items-center justify-center rounded-keystra text-secondary hover:text-primary"
    >
      <CartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span
          aria-hidden="true"
          className="text-label-caps absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 leading-none text-container-lowest"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
