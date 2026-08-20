"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import type { ProductSummary } from "@/types/product";
import { getMessages } from "@/i18n";

export function AddToCartButton({ product }: { product: ProductSummary }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const t = getMessages();

  return (
    <div>
      <Button
        type="button"
        onClick={() => {
          addItem({
            productId: product.id,
            title: product.title,
            priceCents: product.priceCents,
          });
          setAdded(true);
        }}
      >
        {t.product.addToCart}
      </Button>
      <p role="status" className="mt-2 text-sm text-slate-700">
        {added ? t.product.addedToCart : ""}
      </p>
    </div>
  );
}
