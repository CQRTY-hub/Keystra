import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacybeleid" };
export const revalidate = 3600;

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Privacybeleid</h1>

      <p className="mt-4 text-slate-700">
        PLACEHOLDER — nog niet juridisch nagekeken. Vult later aan met: welke
        gegevens, waarom, rechtsgrond, bewaartermijnen, elke verwerker met
        naam (Vercel, Supabase, Mollie, Sentry, de e-mailprovider), transfers
        buiten de EU, en het recht om te klagen bij de
        Gegevensbeschermingsautoriteit.
      </p>
    </article>
  );
}
