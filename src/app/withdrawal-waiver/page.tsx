import type { Metadata } from "next";
import { WITHDRAWAL_WAIVER_VERSION, WITHDRAWAL_WAIVER_TEXT } from "@/lib/consent-text";
import withdrawalWaiverNl from "@/i18n/legal/withdrawal-waiver.nl";
import { parseContentLocale, languageAlternates } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

interface WithdrawalWaiverPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: WithdrawalWaiverPageProps): Promise<Metadata> {
  const locale = parseContentLocale((await searchParams).lang);
  return {
    title: locale === "nl" ? withdrawalWaiverNl.title : t.pageTitles.withdrawalWaiver,
    alternates: languageAlternates("/withdrawal-waiver"),
  };
}

export const revalidate = 3600;

/**
 * Reference-only page: shows the exact withdrawal-waiver text a buyer
 * sees at checkout, in English or Dutch, linked from the checkout
 * checkbox for comprehension (Wetboek Economisch Recht — see PLAN.md).
 * The checkbox itself always shows and stores the English text
 * (WITHDRAWAL_WAIVER_TEXT); this page never becomes what's recorded on
 * an order — only WITHDRAWAL_WAIVER_VERSION does that, from
 * src/lib/consent.ts.
 */
export default async function WithdrawalWaiverPage({
  searchParams,
}: WithdrawalWaiverPageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const text = locale === "nl" ? withdrawalWaiverNl.text : WITHDRAWAL_WAIVER_TEXT;
  const title = locale === "nl" ? withdrawalWaiverNl.title : t.pageTitles.withdrawalWaiver;

  return (
    <article className="max-w-3xl">
      <PageTitleBand title={title}>
        <LanguageToggle current={locale} basePath="/withdrawal-waiver" />
      </PageTitleBand>
      <p className="text-body-md mt-4 text-secondary">
        {t.terms.versionLabel}: {WITHDRAWAL_WAIVER_VERSION}
      </p>
      {locale === "nl" && (
        <p className="text-body-md mt-4 text-secondary">{withdrawalWaiverNl.reviewNotice}</p>
      )}
      <p className="text-body-md mt-4 text-on-surface">{text}</p>
    </article>
  );
}
