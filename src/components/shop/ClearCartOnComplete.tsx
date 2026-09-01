"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";

/**
 * Fixes a real gap found 2026-09-01 while testing the live Mollie
 * integration: the cart was only ever cleared from MockPaymentContent's
 * own "Pay" button (clear() before navigating to the confirmation page)
 * — which never runs for a real payment, since Mollie redirects the
 * browser straight back here on its own. A customer who actually paid
 * still saw their old cart afterward.
 *
 * The order confirmation page (src/app/order/confirmation/[orderId])
 * is a Server Component and has no access to the client-only cart
 * (localStorage) to begin with — so clearing it has to happen from a
 * small client component rendered only in that page's "completed"
 * branch, same trust boundary as everywhere else the cart is touched.
 *
 * Renders nothing. Waits for `hydrated`: CartProvider's own one-time
 * localStorage read runs in an effect too, and effects fire child-first
 * — so an unguarded clear() here would run *before* that read, then get
 * silently overwritten the moment it completes. `useRef` additionally
 * guards against clearing twice on a re-render (e.g. React Strict
 * Mode's double-invoke in development).
 */
export function ClearCartOnComplete() {
  const { clear, hydrated } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clear();
  }, [hydrated, clear]);

  return null;
}
