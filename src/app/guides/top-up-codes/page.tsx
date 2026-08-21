import type { Metadata } from "next";
import topUpGuideEn from "@/i18n/guides/top-up.en";
import topUpGuideNl from "@/i18n/guides/top-up.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale } from "@/i18n/content-locale";

export const metadata: Metadata = { title: topUpGuideEn.title };
export const revalidate = 3600;

interface TopUpCodesGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function TopUpCodesGuidePage({
  searchParams,
}: TopUpCodesGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? topUpGuideNl : topUpGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/top-up-codes" />;
}
