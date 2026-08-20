import type { Metadata } from "next";
import giftCardGuideEn from "@/i18n/guides/gift-card.en";
import { GuideArticle } from "@/components/GuideArticle";

export const metadata: Metadata = { title: giftCardGuideEn.title };
export const revalidate = 3600;

export default function GiftCardsGuidePage() {
  return <GuideArticle guide={giftCardGuideEn} />;
}
