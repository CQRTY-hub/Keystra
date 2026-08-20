import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: {
    default: "Storefront (werktitel)",
    template: "%s — Storefront (werktitel)",
  },
  description: "Digitale game keys.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Winkelmandje" },
  { href: "/order/lookup", label: "Bestelling opzoeken" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className="flex min-h-screen flex-col text-slate-900">
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2 focus:outline focus:outline-2"
          >
            Ga naar hoofdinhoud
          </a>

          <header className="border-b border-slate-200">
            <nav
              aria-label="Hoofdnavigatie"
              className="mx-auto flex max-w-5xl items-center justify-between p-4"
            >
              <Link href="/" className="font-semibold">
                Storefront (werktitel)
              </Link>
              <ul className="flex gap-4">
                {NAV_LINKS.slice(1).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 p-4">
            {children}
          </main>

          <footer className="border-t border-slate-200">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-4 p-4 text-sm">
              <Link href="/terms" className="hover:underline">
                Algemene voorwaarden
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacybeleid
              </Link>
              <Link href="/refund-policy" className="hover:underline">
                Terugbetalingsbeleid
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
          </footer>

          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
