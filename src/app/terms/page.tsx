import type { Metadata } from "next";
import { TERMS_VERSION } from "@/lib/consent-text";
import termsEn from "@/i18n/legal/terms.en";
import termsNl from "@/i18n/legal/terms.nl";
import { getMessages } from "@/i18n";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";

const t = getMessages();

interface TermsPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: TermsPageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? termsNl.title : t.pageTitles.terms,
    alternates: languageAlternates("/terms"),
  };
}

export const revalidate = 3600;

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const content = locale === "nl" ? termsNl : termsEn;
  const title = locale === "nl" ? termsNl.title : t.pageTitles.terms;

  return (
    <article className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <LanguageToggle current={locale} basePath="/terms" />
      </div>
      <p className="text-sm text-slate-500">
        {t.terms.versionLabel}: {TERMS_VERSION}
      </p>

      {content.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
