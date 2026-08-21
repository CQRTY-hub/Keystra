import type { Metadata } from "next";
import { getCookieConsent } from "@/lib/consent";
import { CookiePreferencesForm } from "@/components/CookiePreferencesForm";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.cookiePreferences };
export const dynamic = "force-dynamic"; // reads the visitor's own cookie

export default async function CookiePreferencesPage() {
  const status = await getCookieConsent();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.cookiePreferencesPage.title}</h1>
      <p className="mt-2 text-slate-700">{t.cookiePreferencesPage.intro}</p>
      <div className="mt-6">
        <CookiePreferencesForm initialStatus={status} />
      </div>
    </div>
  );
}
