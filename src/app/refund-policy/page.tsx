import type { Metadata } from "next";
import refundPolicyEn from "@/i18n/legal/refund-policy.en";
import refundPolicyNl from "@/i18n/legal/refund-policy.nl";
import { getMessages } from "@/i18n";
import { parseContentLocale } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.refundPolicy };
export const revalidate = 3600;

interface RefundPolicyPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function RefundPolicyPage({
  searchParams,
}: RefundPolicyPageProps) {
  const locale = parseContentLocale((await searchParams).lang);
  const content = locale === "nl" ? refundPolicyNl : refundPolicyEn;

  return (
    <article className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t.refundPolicy.title}</h1>
        <LanguageToggle current={locale} basePath="/refund-policy" />
      </div>
      {content.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
