import type { Metadata } from "next";
import contactEn from "@/i18n/legal/contact.en";
import { getMessages } from "@/i18n";

export const metadata: Metadata = { title: "Contact" };
export const revalidate = 3600;

export default function ContactPage() {
  const t = getMessages();

  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.contact.title}</h1>
      {contactEn.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
