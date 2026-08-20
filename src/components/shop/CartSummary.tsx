"use client";

import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/currency";
import { Button } from "@/components/ui/Button";

export function CartSummary() {
  const { items, removeItem, setQuantity, totalCents } = useCart();

  if (items.length === 0) {
    return <p className="text-slate-700">Je winkelmandje is leeg.</p>;
  }

  return (
    <div>
      <table className="w-full text-left">
        <caption className="sr-only">Inhoud van je winkelmandje</caption>
        <thead>
          <tr className="border-b border-slate-300">
            <th scope="col" className="py-2">
              Product
            </th>
            <th scope="col" className="py-2">
              Aantal
            </th>
            <th scope="col" className="py-2">
              Prijs
            </th>
            <th scope="col" className="py-2">
              <span className="sr-only">Verwijderen</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className="border-b border-slate-200">
              <td className="py-2">{item.title}</td>
              <td className="py-2">
                <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                  Aantal voor {item.title}
                </label>
                <input
                  id={`qty-${item.productId}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.productId, Number(e.target.value))
                  }
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                />
              </td>
              <td className="py-2">
                {formatPriceCents(item.priceCents * item.quantity)}
              </td>
              <td className="py-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeItem(item.productId)}
                >
                  Verwijderen
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-lg font-medium">
        Totaal: {formatPriceCents(totalCents)}
      </p>
    </div>
  );
}
