import type { Metadata } from "next";
import topUpGuideEn from "@/i18n/guides/top-up.en";
import { GuideArticle } from "@/components/GuideArticle";

export const metadata: Metadata = { title: topUpGuideEn.title };
export const revalidate = 3600;

export default function TopUpCodesGuidePage() {
  return <GuideArticle guide={topUpGuideEn} />;
}
