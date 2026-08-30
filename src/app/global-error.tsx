"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

// Loaded again here (not just in layout.tsx) because this file replaces
// the entire root layout, including whatever set --font-inter there.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

/**
 * Next.js requires this to render its own <html>/<body> — it replaces
 * the entire root layout (CartProvider, nav, footer, all of it) when
 * something throws that high up, so none of that can be assumed to
 * still exist. Deliberately minimal for exactly that reason.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = getMessages();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-surface p-4 font-sans text-on-surface">
        {/* No shared header on this page (it replaces the whole root
            layout) — the band still appears, per DESIGN.md, just scaled
            to this page's own narrow content width instead of the site's
            usual max-w-5xl. */}
        <div className="w-full max-w-md text-center">
          <PageTitleBand title={t.serverError.title} />
          <p className="text-body-md mt-4 text-secondary">{t.serverError.body}</p>
          <button
            type="button"
            onClick={reset}
            className="text-title-sm mt-6 rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
          >
            {t.serverError.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
