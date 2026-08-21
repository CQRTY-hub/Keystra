import type { Metadata } from "next";
import aboutEn from "@/i18n/about.en";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.about };
export const revalidate = 3600;

export default function AboutPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.about.title}</h1>
      {aboutEn.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
