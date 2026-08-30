import type { Metadata } from "next";
import contactEn from "@/i18n/legal/contact.en";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.contact };
export const revalidate = 3600;

const ROWS: { label: string; value: string | null }[] = [
  { label: t.contact.entityLabel, value: contactEn.entityName },
  { label: t.contact.traderLabel, value: `${contactEn.traderName} — ${contactEn.legalForm}` },
  { label: t.contact.emailLabel, value: contactEn.email },
  {
    label: t.contact.responseTimeLabel,
    value: t.contact.responseTimeValue(contactEn.responseTimeBusinessDays),
  },
  { label: t.contact.companyNumberLabel, value: contactEn.companyNumber },
  { label: t.contact.vatNumberLabel, value: contactEn.vatNumber },
  { label: t.contact.addressLabel, value: contactEn.address },
];

export default function ContactPage() {
  return (
    <article className="max-w-3xl">
      <PageTitleBand title={t.contact.title} />
      <dl className="mt-6 flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-label-caps text-secondary">{row.label}</dt>
            <dd className="text-body-md text-on-surface">
              {row.value ?? <span className="text-secondary">{t.contact.toFollow}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
