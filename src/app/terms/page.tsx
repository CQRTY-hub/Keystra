import type { Metadata } from "next";
import { TERMS_VERSION } from "@/lib/consent-text";
import termsEn from "@/i18n/legal/terms.en";
import { getMessages } from "@/i18n";

export const metadata: Metadata = { title: "Terms and conditions" };
export const revalidate = 3600;

export default function TermsPage() {
  const t = getMessages();

  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.terms.title}</h1>
      <p className="text-sm text-slate-500">
        {t.terms.versionLabel}: {TERMS_VERSION}
      </p>

      {termsEn.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
