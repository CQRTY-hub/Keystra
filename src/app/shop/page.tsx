import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getProducts } from "@/lib/products";
import { getMessages } from "@/i18n";
import type { ProductCategory } from "@/types/product";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.shop };
export const revalidate = 3600;

const CATEGORIES: ProductCategory[] = ["game_key", "gift_card", "top_up"];

interface ShopPageProps {
  searchParams: Promise<{ category?: string; region?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
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
      <PageTitleBand title={t.shop.title} />

      {/* Plain GET form — filtering and search both work without client JS.
          Not a buy action, so the submit button stays "secondary" (teal),
          same rule as the homepage's search field. */}
      <form
        className="mt-4 flex flex-wrap items-end gap-gutter"
        aria-label={t.shop.filtersLabel}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-title-sm text-on-surface">
            {t.shop.searchLabel}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={t.shop.searchPlaceholder}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface placeholder:text-secondary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-title-sm text-on-surface">
            {t.shop.categoryLabel}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
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
          <label htmlFor="region" className="text-title-sm text-on-surface">
            {t.shop.regionLabel}
          </label>
          <select
            id="region"
            name="region"
            defaultValue={region ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
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
          className="text-title-sm rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
        >
          {t.shop.filterButton}
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="text-body-md mt-8 text-secondary">{t.shop.noResults}</p>
      ) : (
        // Same compact ratio as the homepage's Trending Now grid — more
        // products per row, smaller image, so mediocre supplier boxart
        // has less room to stand out.
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
