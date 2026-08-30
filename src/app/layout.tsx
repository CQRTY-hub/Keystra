import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CookieConsent } from "@/components/CookieConsent";
import { SearchIcon, TrackOrderIcon } from "@/components/icons";
import { HeaderCartLink } from "@/components/HeaderCartLink";
import { isMaintenanceModeEnabled } from "@/lib/kill-switch";
import { getMessages } from "@/i18n";

/**
 * PLAN.md Phase 3.5, "The noodknop", Level 3: "Order lookup and key
 * retrieval keep working at every level, including full maintenance."
 * Read narrowly and literally — only order lookup and the confirmation
 * page (where a key is actually retrieved) are exempt; everything else,
 * including the legal pages, goes behind the notice. /maintenance itself
 * is exempt so this doesn't redirect-loop into itself, and /admin is
 * handled separately below (an admin has to be able to turn this back
 * off from inside the admin panel it just locked everyone else out of).
 */
function isExemptFromMaintenance(pathname: string): boolean {
  return (
    pathname.startsWith("/order/lookup") ||
    pathname.startsWith("/order/confirmation") ||
    pathname === "/maintenance"
  );
}

// DESIGN.md: "Typography (Inter)". Self-hosted via next/font (no runtime
// request to Google Fonts), exposed as --font-inter for globals.css's
// --font-sans token to pick up.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteMessages = getMessages();

export const metadata: Metadata = {
  // Lets every page below set relative canonical/hreflang URLs (see
  // /terms, /refund-policy, /withdrawal-waiver, /guides/*) instead of
  // each needing to know the full site origin.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: siteMessages.site.titleDefault,
    template: siteMessages.site.titleTemplate,
  },
  description: siteMessages.site.description,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = getMessages();
  // Set by middleware.ts (Prisma-free, Edge-safe) so this Server
  // Component can tell it's rendering an /admin/* page and skip the
  // public shop chrome for it — a backstage login/dashboard screen
  // shouldn't have the storefront's nav, cart icon, and cookie banner
  // floating over it. src/app/admin/layout.tsx supplies its own chrome
  // instead.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen bg-surface font-sans text-on-surface">
          {children}
        </body>
      </html>
    );
  }

  if (!isExemptFromMaintenance(pathname) && (await isMaintenanceModeEnabled())) {
    redirect("/maintenance");
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-on-surface">
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-keystra focus:bg-container focus:p-2 focus:text-on-surface focus:outline focus:outline-2 focus:outline-primary"
          >
            {t.nav.skipToContent}
          </a>

          <header className="border-b border-outline">
            <nav
              aria-label={t.nav.mainNavigation}
              className="mx-auto flex max-w-5xl flex-wrap items-center gap-gutter p-gutter"
            >
              <Link
                href="/"
                className="text-title-sm shrink-0 tracking-[0.08em] text-on-surface"
              >
                {t.nav.brand.toUpperCase()}
              </Link>

              {/* Quick search — plain GET, same /shop?q= the shop page's
                  own filter form reads. The shop page keeps its fuller
                  search+filter form; this is the fast global entry point
                  the Stitch reference puts in the header on every page. */}
              <form action="/shop" className="order-3 min-w-0 flex-1 basis-full sm:order-none sm:basis-56">
                <label htmlFor="header-search" className="sr-only">
                  {t.shop.searchLabel}
                </label>
                <div className="flex items-center gap-2 rounded-keystra border border-outline bg-container-lowest px-3 py-1.5">
                  <SearchIcon className="h-4 w-4 shrink-0 text-secondary" />
                  <input
                    id="header-search"
                    name="q"
                    type="search"
                    placeholder={t.shop.searchPlaceholder}
                    className="text-body-md min-w-0 flex-1 bg-transparent text-on-surface placeholder:text-secondary focus-visible:outline-none"
                  />
                </div>
              </form>

              <ul className="ml-auto flex shrink-0 items-center gap-3">
                <li>
                  <Link
                    href="/shop"
                    className="text-title-sm text-secondary hover:text-primary"
                  >
                    {t.nav.shop}
                  </Link>
                </li>
                <li>
                  <HeaderCartLink />
                </li>
                <li>
                  <Link
                    href="/order/lookup"
                    aria-label={t.nav.orderLookup}
                    className="flex h-11 w-11 items-center justify-center rounded-keystra text-secondary hover:text-primary"
                  >
                    <TrackOrderIcon className="h-5 w-5" />
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 p-gutter">
            {children}
          </main>

          <footer className="border-t border-outline">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-gutter p-gutter text-body-md">
              <Link href="/guides" className="text-secondary hover:text-primary">
                {t.footer.guides}
              </Link>
              <Link href="/faq" className="text-secondary hover:text-primary">
                {t.footer.faq}
              </Link>
              <Link href="/about" className="text-secondary hover:text-primary">
                {t.footer.about}
              </Link>
              <Link href="/contact" className="text-secondary hover:text-primary">
                {t.footer.contact}
              </Link>
              <Link href="/terms" className="text-secondary hover:text-primary">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="text-secondary hover:text-primary">
                {t.footer.privacy}
              </Link>
              <Link href="/refund-policy" className="text-secondary hover:text-primary">
                {t.footer.refundPolicy}
              </Link>
              <Link href="/cookie-preferences" className="text-secondary hover:text-primary">
                {t.footer.cookiePreferences}
              </Link>
            </div>
          </footer>

          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
