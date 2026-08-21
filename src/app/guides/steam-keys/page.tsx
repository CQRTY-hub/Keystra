import type { Metadata } from "next";
import steamGuideEn from "@/i18n/guides/steam.en";
import steamGuideNl from "@/i18n/guides/steam.nl";
import { GuideArticle } from "@/components/GuideArticle";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";

interface SteamKeysGuidePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SteamKeysGuidePageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? steamGuideNl.title : steamGuideEn.title,
    alternates: languageAlternates("/guides/steam-keys"),
  };
}

export const revalidate = 3600;

export default async function SteamKeysGuidePage({
  searchParams,
}: SteamKeysGuidePageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const guide = locale === "nl" ? steamGuideNl : steamGuideEn;

  return <GuideArticle guide={guide} locale={locale} basePath="/guides/steam-keys" />;
}
