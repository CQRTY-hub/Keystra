import type { Metadata } from "next";
import steamGuideEn from "@/i18n/guides/steam.en";
import steamGuideNl from "@/i18n/guides/steam.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale } from "@/i18n/content-locale";

export const metadata: Metadata = { title: steamGuideEn.title };
export const revalidate = 3600;

interface SteamKeysGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function SteamKeysGuidePage({
  searchParams,
}: SteamKeysGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? steamGuideNl : steamGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/steam-keys" />;
}
