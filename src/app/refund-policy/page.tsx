import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terugbetalingsbeleid" };
export const revalidate = 3600;

export default function RefundPolicyPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Terugbetalingsbeleid</h1>

      <p className="mt-4 text-slate-700">
        PLACEHOLDER — nog niet juridisch nagekeken. Legt later uit: de
        14-dagen-regel, de uitzondering voor digitale content, en dat die
        uitzondering van toepassing is zodra je akkoord gaat met
        onmiddellijke levering bij het afrekenen.
      </p>

      <p className="mt-4 text-slate-700">
        Een foutieve key wordt via het contactformulier gemeld, met
        screenshots. We sturen nooit automatisch een vervangende key en
        betalen niet terug voordat de leverancier heeft gereageerd — zie
        de procedure in de algemene voorwaarden.
      </p>
    </article>
  );
}
