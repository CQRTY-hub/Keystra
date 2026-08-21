import type { Metadata } from "next";
import giftCardGuideEn from "@/i18n/guides/gift-card.en";
import giftCardGuideNl from "@/i18n/guides/gift-card.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale } from "@/i18n/content-locale";

export const metadata: Metadata = { title: giftCardGuideEn.title };
export const revalidate = 3600;

interface GiftCardsGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function GiftCardsGuidePage({
  searchParams,
}: GiftCardsGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? giftCardGuideNl : giftCardGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/gift-cards" />;
}
