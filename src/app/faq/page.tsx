import type { Metadata } from "next";
import faqEn from "@/i18n/faq.en";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.faq };
export const revalidate = 3600;

export default function FaqPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.faq.title}</h1>
      <dl className="mt-6 flex flex-col gap-6">
        {faqEn.map((item, i) => (
          <div key={i}>
            <dt className="font-medium text-slate-900">{item.question}</dt>
            <dd className="mt-1 text-slate-700">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
