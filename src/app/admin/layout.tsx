import Link from "next/link";
import { getMessages } from "@/i18n";

/**
 * Its own root for everything under /admin — no public header, footer,
 * search, cart icon, or cookie banner (see src/app/layout.tsx, which
 * skips all of that for /admin/* specifically). This is a backstage
 * surface, not a themed variant of the storefront.
 *
 * Top-down flow, not centered — orders/products lists need width and
 * height, not a centered card. The login/verify pages (the only ones
 * that want a centered card) supply their own centering wrapper instead.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = getMessages();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-keystra focus:bg-container focus:p-2 focus:text-on-surface focus:outline focus:outline-2 focus:outline-primary"
      >
        {t.nav.skipToContent}
      </a>
      <header className="border-b border-outline">
        <div className="mx-auto flex max-w-5xl items-center px-gutter py-4">
          <Link href="/admin" className="text-title-sm tracking-[0.08em] text-on-surface">
            {t.admin.wordmark.toUpperCase()}
          </Link>
        </div>
      </header>
      <main id="admin-main" className="mx-auto w-full max-w-5xl flex-1 p-gutter">
        {children}
      </main>
    </div>
  );
}
