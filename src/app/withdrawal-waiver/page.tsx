import type { Metadata } from "next";
import { WITHDRAWAL_WAIVER_VERSION, WITHDRAWAL_WAIVER_TEXT } from "@/lib/consent-text";
import withdrawalWaiverNl from "@/i18n/legal/withdrawal-waiver.nl";
import { parseContentLocale } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.withdrawalWaiver };
export const revalidate = 3600;

interface WithdrawalWaiverPageProps {
  searchParams: Promise<{ lang?: string }>;
}

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

  return (
    <article className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t.pageTitles.withdrawalWaiver}</h1>
        <LanguageToggle current={locale} basePath="/withdrawal-waiver" />
      </div>
      <p className="text-sm text-slate-500">
        {t.terms.versionLabel}: {WITHDRAWAL_WAIVER_VERSION}
      </p>
      <p className="mt-4 text-slate-700">{text}</p>
    </article>
  );
}
