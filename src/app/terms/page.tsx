import type { Metadata } from "next";
import { TERMS_VERSION } from "@/lib/consent-text";
import termsEn from "@/i18n/legal/terms.en";
import termsNl from "@/i18n/legal/terms.nl";
import { getMessages } from "@/i18n";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PageTitleBand } from "@/components/PageTitleBand";

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
      <PageTitleBand title={title}>
        <LanguageToggle current={locale} basePath="/terms" />
      </PageTitleBand>
      <p className="text-body-md mt-4 text-secondary">
        {t.terms.versionLabel}: {TERMS_VERSION}
      </p>

      {content.paragraphs.map((paragraph, i) => (
        <p key={i} className="text-body-md mt-4 text-on-surface">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
