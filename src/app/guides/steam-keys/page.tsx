import type { Metadata } from "next";
import steamGuideEn from "@/i18n/guides/steam.en";
import { GuideArticle } from "@/components/GuideArticle";

export const metadata: Metadata = { title: steamGuideEn.title };
export const revalidate = 3600;

export default function SteamKeysGuidePage() {
  return <GuideArticle guide={steamGuideEn} />;
}
