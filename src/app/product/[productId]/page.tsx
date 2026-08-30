import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { PageTitleBand } from "@/components/PageTitleBand";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { getProductById, getProducts } from "@/lib/products";
import { formatPriceCents } from "@/lib/currency";
import { getMessages } from "@/i18n";
import { GUIDE_ROUTES } from "@/lib/guide-routes";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ productId: p.id }));
}

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) return {};
  const t = getMessages();
  const description = `${product.title} — ${t.category[product.category]}, region ${product.region}.`;
  return {
    title: product.title,
    description,
    openGraph: { title: product.title, description },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const t = getMessages();
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) notFound();

  return (
    <div>
      <PageTitleBand title={product.title} />
      <div className="mt-4 flex gap-2">
        <Badge>{t.category[product.category]}</Badge>
        <Badge>{product.region}</Badge>
      </div>
      <p className="text-headline-md mt-4 text-on-surface">
        {formatPriceCents(product.priceCents)}
      </p>

      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>

      <section className="mt-8">
        <h2 className="text-title-sm text-on-surface">{t.product.redemptionTitle}</h2>
        <p className="text-body-md mt-2 text-secondary">{t.product.redemptionBody}</p>
        <p className="mt-2">
          <Link
            href={GUIDE_ROUTES[product.category]}
            className="text-secondary underline hover:text-primary"
          >
            {t.product.howToRedeem}
          </Link>
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-title-sm text-on-surface">{t.product.regionTitle}</h2>
        <p className="text-body-md mt-2 text-secondary">{t.product.regionBody(product.region)}</p>
      </section>

      {/* Informatieverplichtingen-toetsing.md, finding 2.3: the guideline
          recommends a link to the withdrawal-right/refund information
          right from the product fiche, not only reachable later via the
          footer or the checkout page. */}
      <p className="mt-6">
        <Link
          href="/refund-policy"
          className="text-secondary underline hover:text-primary"
        >
          {t.product.withdrawalLinkLabel}
        </Link>
      </p>
    </div>
  );
}
