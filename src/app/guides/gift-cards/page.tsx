import type { Metadata } from "next";
import giftCardGuideEn from "@/i18n/guides/gift-card.en";
import giftCardGuideNl from "@/i18n/guides/gift-card.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";

interface GiftCardsGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: GiftCardsGuidePageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? giftCardGuideNl.title : giftCardGuideEn.title,
    alternates: languageAlternates("/guides/gift-cards"),
  };
}

export const revalidate = 3600;

export default async function GiftCardsGuidePage({
  searchParams,
}: GiftCardsGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? giftCardGuideNl : giftCardGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/gift-cards" />;
}
