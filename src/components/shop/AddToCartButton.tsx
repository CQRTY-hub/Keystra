"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import type { ProductSummary } from "@/types/product";

export function AddToCartButton({ product }: { product: ProductSummary }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

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
        In winkelmandje
      </Button>
      <p role="status" className="mt-2 text-sm text-slate-700">
        {added ? "Toegevoegd aan winkelmandje." : ""}
      </p>
    </div>
  );
}
