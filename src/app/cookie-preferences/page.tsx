import type { Metadata } from "next";
import { getCookieConsent } from "@/lib/consent";
import { CookiePreferencesForm } from "@/components/CookiePreferencesForm";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.cookiePreferences };
export const dynamic = "force-dynamic"; // reads the visitor's own cookie

export default async function CookiePreferencesPage() {
  const status = await getCookieConsent();

  return (
    <div>
      <PageTitleBand title={t.cookiePreferencesPage.title} />
      <p className="text-body-md mt-4 text-secondary">{t.cookiePreferencesPage.intro}</p>
      <div className="mt-6">
        <CookiePreferencesForm initialStatus={status} />
      </div>
    </div>
  );
}
