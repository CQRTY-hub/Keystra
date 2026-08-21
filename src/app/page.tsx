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

      {/* PLAN.md: search is the first thing a visitor reaches for — plain
          GET straight to /shop, same query param the shop page's own
          search field reads, no client JS required either place. */}
      <form action="/shop" className="mt-6 flex max-w-md gap-2">
        <label htmlFor="home-search" className="sr-only">
          {t.shop.searchLabel}
        </label>
        <input
          id="home-search"
          name="q"
          type="search"
          placeholder={t.shop.searchPlaceholder}
          className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          {t.shop.searchButton}
        </button>
      </form>

      <h2 className="mt-8 text-lg font-medium">{t.home.featured}</h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}
