"use client";

import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

export function CartSummary() {
  const { items, removeItem, setQuantity, totalCents } = useCart();
  const t = getMessages();

  if (items.length === 0) {
    return <p className="text-body-md text-secondary">{t.cart.empty}</p>;
  }

  return (
    <div>
      {/* Below sm (640px): a stacked card per item — a full-width table
          squeezed a long product title onto three lines and pushed the
          total further down than it needed to be. From sm up there's
          room for the tidy table instead. Both read from the same
          `items`; only the markup differs. */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {items.map((item) => (
          <li
            key={item.productId}
            className="rounded-keystra border border-outline bg-container p-3"
          >
            <p className="text-body-md text-on-surface">{item.title}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="sr-only" htmlFor={`qty-mobile-${item.productId}`}>
                {t.cart.quantityLabelFor(item.title)}
              </label>
              <input
                id={`qty-mobile-${item.productId}`}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                className="w-16 rounded-keystra border border-outline bg-container-lowest px-2 py-1 text-on-surface"
              />
              <p className="text-title-sm text-on-surface">
                {formatPriceCents(item.priceCents * item.quantity)}
              </p>
              <Button type="button" variant="secondary" onClick={() => removeItem(item.productId)}>
                {t.cart.remove}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <table className="hidden w-full text-left sm:table">
        <caption className="sr-only">{t.cart.tableCaption}</caption>
        <thead>
          <tr className="text-title-sm border-b border-outline text-on-surface">
            <th scope="col" className="py-2 font-medium">
              {t.cart.productHeader}
            </th>
            <th scope="col" className="py-2 font-medium">
              {t.cart.quantityHeader}
            </th>
            <th scope="col" className="py-2 font-medium">
              {t.cart.priceHeader}
            </th>
            <th scope="col" className="py-2">
              <span className="sr-only">{t.cart.removeHeader}</span>
            </th>
          </tr>
        </thead>
        <tbody className="text-body-md text-on-surface">
          {items.map((item) => (
            <tr key={item.productId} className="border-b border-outline">
              <td className="py-2">{item.title}</td>
              <td className="py-2">
                <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                  {t.cart.quantityLabelFor(item.title)}
                </label>
                <input
                  id={`qty-${item.productId}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.productId, Number(e.target.value))
                  }
                  className="w-16 rounded-keystra border border-outline bg-container-lowest px-2 py-1 text-on-surface"
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
                  {t.cart.remove}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-headline-md mt-4 text-on-surface">
        {t.cart.total(formatPriceCents(totalCents))}
      </p>
    </div>
  );
}
