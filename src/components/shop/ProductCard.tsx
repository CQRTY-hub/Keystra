import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ProductSummary } from "@/types/product";
import { formatPriceCents } from "@/lib/currency";
import { getMessages } from "@/i18n";

/**
 * DESIGN.md, Cards > Product Card + the product-image addition. The image
 * frame is fixed 1:1 with a Container Low fill regardless of what (if
 * anything) is behind it — supplier boxart arrives in inconsistent aspect
 * ratios and quality, and the frame absorbs that instead of the grid.
 * Product.imageUrl doesn't exist yet (Phase 1 has no real supplier
 * imagery), so every card renders the placeholder fill today; swapping in
 * a real <img> later doesn't change the frame.
 *
 * The small dot on the image is the one place cyan appears outside a buy
 * button — DESIGN.md's single sanctioned status indicator, here meaning
 * "in stock" (this product is active in the catalogue).
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const t = getMessages();

  return (
    <li className="rounded-keystra border border-outline bg-container p-3 transition-transform hover:-translate-y-0.5">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-keystra border border-outline bg-container-low">
          <span className="text-label-caps absolute inset-0 flex items-center justify-center text-center text-secondary">
            {t.category[product.category]}
          </span>
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"
            role="status"
            aria-label={t.product.inStock}
          />
        </div>
      </Link>

      <h3 className="text-title-sm mt-3 text-on-surface">
        <Link href={`/product/${product.id}`} className="hover:text-secondary">
          {product.title}
        </Link>
      </h3>
      <div className="mt-2 flex gap-2">
        <Badge>{t.category[product.category]}</Badge>
        <Badge>{product.region}</Badge>
      </div>
      <p className="text-title-sm mt-2 text-on-surface">
        {formatPriceCents(product.priceCents)}
      </p>
    </li>
  );
}
