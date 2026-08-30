import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { HomeHeroArt } from "@/components/HomeHeroArt";
import { ArrowRightIcon, TrendingIcon } from "@/components/icons";
import { getProducts } from "@/lib/products";
import { getMessages } from "@/i18n";

export const revalidate = 3600;

/**
 * Placeholder-only — see DESIGN.md "Activity module". There is no real
 * order-activity feed behind this yet; it must become real, anonymized
 * order data (or be removed) before a real launch. Product names are the
 * actual catalogue's, not invented titles — only the buyer and the
 * timestamp are illustrative.
 */
const RECENT_ACTIVITY = [
  { initials: "J.D.", product: "Sample Adventure Game — Standard Edition", time: "2m ago" },
  { initials: "A.K.", product: "Sample Strategy Game", time: "9m ago" },
  { initials: "M.V.", product: "Sample Store Gift Card — €25", time: "24m ago" },
  { initials: "S.R.", product: "Sample Game Top-up — 1000 Points", time: "41m ago" },
] as const;

/**
 * DESIGN.md's Display style (36/42, added for exactly this) carries the
 * hero; every other heading on this page stays Headline MD or smaller,
 * per that same addition ("at most once per page").
 *
 * Cyan usage here follows the revised rule in DESIGN.md: the hero's one
 * accent line, the hero's one primary action (this page has no buy
 * button of its own), the Trending Now section icon, and each activity
 * row's buyer initials. Everything else — the platform strip in the
 * header, "View all", plain body copy — stays Secondary or On Surface.
 */
export default async function HomePage() {
  const t = getMessages();
  const allProducts = await getProducts();
  // QA scenario products (out-of-stock, timeout, etc.) exist to click
  // through fulfillment edge cases in dev/testing — never real inventory
  // a shopper should see featured on the homepage.
  const featured = allProducts.filter((p) => !p.title.startsWith("[QA]")).slice(0, 8);

  return (
    <div className="grid gap-gutter lg:grid-cols-[1fr_296px] lg:items-start">
      <div>
        <div className="relative overflow-hidden rounded-keystra border border-outline p-8 sm:p-10">
          <HomeHeroArt />
          <div className="relative z-10">
            <h1 className="text-display max-w-lg text-on-surface">
              <span className="block">{t.home.heroLine}</span>
              <span className="block text-primary">{t.home.heroAccent}</span>
            </h1>
            <p className="text-body-md mt-4 max-w-md text-secondary">{t.home.heroSubtext}</p>
            <Link
              href="/shop"
              className="text-title-sm mt-6 inline-flex items-center gap-2 rounded-keystra bg-primary px-4 py-2 text-on-primary hover:opacity-90"
            >
              {t.home.browseFullRange}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingIcon className="h-5 w-5 text-primary" />
              <h2 className="text-title-sm text-on-surface">{t.home.trendingNow}</h2>
            </div>
            <Link href="/shop" className="text-body-md text-secondary hover:text-primary">
              {t.home.viewAll}
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        </section>
      </div>

      <aside className="rounded-keystra border border-outline bg-container p-4 lg:sticky lg:top-4">
        <h2 className="text-title-sm text-on-surface">{t.home.recentActivityTitle}</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {RECENT_ACTIVITY.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="text-label-caps flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-container-low text-secondary">
                {item.initials.replace(/\./g, "")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body-md truncate text-on-surface">
                  <span className="text-primary">{item.initials}</span>{" "}
                  {t.home.recentActivityPurchased(item.product)}
                </p>
                <p className="text-label-caps text-secondary">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
