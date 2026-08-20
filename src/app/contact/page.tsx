import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };
export const revalidate = 3600;

export default function ContactPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-4 text-slate-700">
        PLACEHOLDER — vult later aan met echte bedrijfsgegevens: rechtspersoon,
        adres, e-mail, telefoonnummer, ondernemingsnummer en BTW-nummer (zie
        PLAN.md Appendix, &ldquo;Trader identity&rdquo;).
      </p>
    </article>
  );
}
