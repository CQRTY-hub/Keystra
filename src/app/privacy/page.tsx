import type { Metadata } from "next";
import privacyEn from "@/i18n/legal/privacy.en";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.privacy };
export const revalidate = 3600;

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl">
      <PageTitleBand title={t.privacy.title} />
      {privacyEn.paragraphs.map((paragraph, i) => (
        <p key={i} className="text-body-md mt-4 text-on-surface">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
