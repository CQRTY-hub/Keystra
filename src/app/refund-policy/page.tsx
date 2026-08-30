import type { Metadata } from "next";
import refundPolicyEn from "@/i18n/legal/refund-policy.en";
import refundPolicyNl from "@/i18n/legal/refund-policy.nl";
import { getMessages } from "@/i18n";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PageTitleBand } from "@/components/PageTitleBand";

const t = getMessages();

interface RefundPolicyPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: RefundPolicyPageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? refundPolicyNl.title : t.pageTitles.refundPolicy,
    alternates: languageAlternates("/refund-policy"),
  };
}

export const revalidate = 3600;

export default async function RefundPolicyPage({
  searchParams,
}: RefundPolicyPageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const content = locale === "nl" ? refundPolicyNl : refundPolicyEn;
  const title = locale === "nl" ? refundPolicyNl.title : t.pageTitles.refundPolicy;

  return (
    <article className="max-w-3xl">
      <PageTitleBand title={title}>
        <LanguageToggle current={locale} basePath="/refund-policy" />
      </PageTitleBand>
      {content.paragraphs.map((paragraph, i) => (
        <p key={i} className="text-body-md mt-4 text-on-surface">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
