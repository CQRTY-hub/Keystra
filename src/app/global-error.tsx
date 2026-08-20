"use client";

import "./globals.css";
import { getMessages } from "@/i18n";

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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-4 text-center text-slate-900">
        <h1 className="text-2xl font-semibold">{t.serverError.title}</h1>
        <p className="mt-2 max-w-md text-slate-700">{t.serverError.body}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          {t.serverError.retry}
        </button>
      </body>
    </html>
  );
}
