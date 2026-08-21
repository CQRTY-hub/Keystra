import type { Metadata } from "next";
import topUpGuideEn from "@/i18n/guides/top-up.en";
import topUpGuideNl from "@/i18n/guides/top-up.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";

interface TopUpCodesGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: TopUpCodesGuidePageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? topUpGuideNl.title : topUpGuideEn.title,
    alternates: languageAlternates("/guides/top-up-codes"),
  };
}

export const revalidate = 3600;

export default async function TopUpCodesGuidePage({
  searchParams,
}: TopUpCodesGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? topUpGuideNl : topUpGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/top-up-codes" />;
}
