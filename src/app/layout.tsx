import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CookieConsent } from "@/components/CookieConsent";
import { getMessages } from "@/i18n";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = getMessages();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col text-slate-900">
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:outline focus:outline-2"
          >
            {t.nav.skipToContent}
          </a>

          <header className="border-b border-slate-200">
            <nav
              aria-label={t.nav.mainNavigation}
              className="mx-auto flex max-w-5xl items-center justify-between p-4"
            >
              <Link href="/" className="font-semibold">
                {t.nav.brand}
              </Link>
              <ul className="flex flex-wrap gap-4">
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t.nav.shop}
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:underline">
                    {t.nav.cart}
                  </Link>
                </li>
                <li>
                  <Link href="/order/lookup" className="hover:underline">
                    {t.nav.orderLookup}
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 p-4">
            {children}
          </main>

          <footer className="border-t border-slate-200">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-4 p-4 text-sm">
              <Link href="/guides" className="hover:underline">
                {t.footer.guides}
              </Link>
              <Link href="/faq" className="hover:underline">
                {t.footer.faq}
              </Link>
              <Link href="/about" className="hover:underline">
                {t.footer.about}
              </Link>
              <Link href="/contact" className="hover:underline">
                {t.footer.contact}
              </Link>
              <Link href="/terms" className="hover:underline">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="hover:underline">
                {t.footer.privacy}
              </Link>
              <Link href="/refund-policy" className="hover:underline">
                {t.footer.refundPolicy}
              </Link>
              <Link href="/cookie-preferences" className="hover:underline">
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
