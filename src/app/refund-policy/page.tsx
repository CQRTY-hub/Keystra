import type { Metadata } from "next";
import refundPolicyEn from "@/i18n/legal/refund-policy.en";
import { getMessages } from "@/i18n";

export const metadata: Metadata = { title: "Refund policy" };
export const revalidate = 3600;

export default function RefundPolicyPage() {
  const t = getMessages();

  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.refundPolicy.title}</h1>
      {refundPolicyEn.paragraphs.map((paragraph, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
