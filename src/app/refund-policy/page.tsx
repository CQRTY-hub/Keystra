import type { Metadata } from "next";
import refundPolicyEn from "@/i18n/legal/refund-policy.en";
import refundPolicyNl from "@/i18n/legal/refund-policy.nl";
import { getMessages } from "@/i18n";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <LanguageToggle current={locale} basePath="/refund-policy" />
      </div>
      {content.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
