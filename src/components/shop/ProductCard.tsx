import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ProductSummary } from "@/types/product";
import { formatPriceCents } from "@/lib/currency";
import { getMessages } from "@/i18n";

export function ProductCard({ product }: { product: ProductSummary }) {
  const t = getMessages();

  return (
    <li className="rounded border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900">
        <Link href={`/product/${product.id}`} className="hover:underline">
          {product.title}
        </Link>
      </h3>
      <div className="mt-2 flex gap-2">
        <Badge>{t.category[product.category]}</Badge>
        <Badge>{product.region}</Badge>
      </div>
      <p className="mt-2 font-medium">{formatPriceCents(product.priceCents)}</p>
    </li>
  );
}
