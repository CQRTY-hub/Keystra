import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products";
import { getMessages } from "@/i18n";

export const revalidate = 3600;

export default async function HomePage() {
  const t = getMessages();
  const products = await getProducts();
  const featured = products.slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.home.title}</h1>
      <p className="mt-2 text-slate-700">
        {t.home.intro}{" "}
        <Link href="/shop" className="underline">
          {t.home.browseFullRange}
        </Link>
        .
      </p>

      <h2 className="mt-8 text-lg font-medium">{t.home.featured}</h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}
