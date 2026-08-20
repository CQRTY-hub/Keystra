import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products";
import { getMessages } from "@/i18n";
import type { ProductCategory } from "@/types/product";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 3600;

const CATEGORIES: ProductCategory[] = ["game_key", "gift_card", "top_up"];

interface ShopPageProps {
  searchParams: Promise<{ category?: string; region?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const t = getMessages();
  const { category, region, q } = await searchParams;
  const allProducts = await getProducts();

  const regions = [...new Set(allProducts.map((p) => p.region))].sort();

  const query = q?.trim().toLowerCase() ?? "";

  const filtered = allProducts.filter(
    (p) =>
      (!category || p.category === category) &&
      (!region || p.region === region) &&
      (!query || p.title.toLowerCase().includes(query))
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.shop.title}</h1>

      {/* Plain GET form — filtering and search both work without client JS. */}
      <form
        className="mt-4 flex flex-wrap items-end gap-4"
        aria-label={t.shop.filtersLabel}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium">
            {t.shop.searchLabel}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={t.shop.searchPlaceholder}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium">
            {t.shop.categoryLabel}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t.shop.categoryAll}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.category[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="region" className="text-sm font-medium">
            {t.shop.regionLabel}
          </label>
          <select
            id="region"
            name="region"
            defaultValue={region ?? ""}
            className="rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t.shop.regionAll}</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          {t.shop.filterButton}
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-8 text-slate-700">{t.shop.noResults}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
