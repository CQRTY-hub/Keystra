import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { getProductById, getProducts } from "@/lib/products";
import { formatPriceCents } from "@/lib/currency";

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
  return {
    title: product.title,
    description: `${product.title} — ${product.platform}, regio ${product.region}.`,
    openGraph: {
      title: product.title,
      description: `${product.title} — ${product.platform}, regio ${product.region}.`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <div className="mt-2 flex gap-2">
        <Badge>{product.platform}</Badge>
        <Badge>{product.region}</Badge>
      </div>
      <p className="mt-4 text-xl font-medium">
        {formatPriceCents(product.priceCents)}
      </p>

      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Inwisselinstructies</h2>
        <p className="mt-2 text-slate-700">
          Na betaling ontvang je direct een key op deze site en per e-mail.
          Wissel de key in via de bijbehorende platformclient ({product.platform}).
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Regio en levering</h2>
        <p className="mt-2 text-slate-700">
          Deze key is gebonden aan regio {product.region}. Levering gebeurt
          elektronisch, direct na bevestigde betaling.
        </p>
      </section>
    </div>
  );
}
