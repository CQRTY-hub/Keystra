import type { Metadata } from "next";
import faqEn from "@/i18n/faq.en";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.faq };
export const revalidate = 3600;

export default function FaqPage() {
  return (
    <div className="max-w-3xl">
      <PageTitleBand title={t.faq.title} />
      <dl className="mt-6 flex flex-col gap-6">
        {faqEn.map((item, i) => (
          <div key={i}>
            <dt className="text-title-sm text-on-surface">{item.question}</dt>
            <dd className="text-body-md mt-1 text-secondary">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
