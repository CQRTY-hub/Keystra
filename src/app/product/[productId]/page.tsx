import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
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
      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <div className="mt-2 flex gap-2">
        <Badge>{t.category[product.category]}</Badge>
        <Badge>{product.region}</Badge>
      </div>
      <p className="mt-4 text-xl font-medium">
        {formatPriceCents(product.priceCents)}
      </p>

      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">{t.product.redemptionTitle}</h2>
        <p className="mt-2 text-slate-700">{t.product.redemptionBody}</p>
        <p className="mt-2">
          <Link href={GUIDE_ROUTES[product.category]} className="underline">
            {t.product.howToRedeem}
          </Link>
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">{t.product.regionTitle}</h2>
        <p className="mt-2 text-slate-700">{t.product.regionBody(product.region)}</p>
      </section>
    </div>
  );
}
