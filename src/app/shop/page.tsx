import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 3600;

interface ShopPageProps {
  searchParams: Promise<{ platform?: string; region?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { platform, region } = await searchParams;
  const allProducts = await getProducts();

  const platforms = [...new Set(allProducts.map((p) => p.platform))].sort();
  const regions = [...new Set(allProducts.map((p) => p.region))].sort();

  const filtered = allProducts.filter(
    (p) => (!platform || p.platform === platform) && (!region || p.region === region)
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Shop</h1>

      {/* Plain GET form — filtering works without client JS. */}
      <form className="mt-4 flex flex-wrap items-end gap-4" aria-label="Filters">
        <div className="flex flex-col gap-1">
          <label htmlFor="platform" className="text-sm font-medium">
            Platform
          </label>
          <select
            id="platform"
            name="platform"
            defaultValue={platform ?? ""}
            className="rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Alle platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="region" className="text-sm font-medium">
            Regio
          </label>
          <select
            id="region"
            name="region"
            defaultValue={region ?? ""}
            className="rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Alle regio&apos;s</option>
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
          Filteren
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-8 text-slate-700">Geen producten gevonden.</p>
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
