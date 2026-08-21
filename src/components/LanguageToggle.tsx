import Link from "next/link";
import type { ContentLocale } from "@/i18n/content-locale";
import { getMessages } from "@/i18n";

/**
 * Language names shown in their own language, not translated — the
 * standard exception in a language picker (same reason a currency code
 * isn't translated). Everything else on the page still goes through the
 * content-locale files this toggles between.
 */
export function LanguageToggle({
  current,
  basePath,
}: {
  current: ContentLocale;
  basePath: string;
}) {
  const t = getMessages();

  return (
    <nav aria-label={t.languageToggle.ariaLabel} className="flex gap-3 text-sm">
      {current === "en" ? (
        <span className="font-medium underline">English</span>
      ) : (
        <Link href={basePath} className="hover:underline">
          English
        </Link>
      )}
      {current === "nl" ? (
        <span className="font-medium underline">Nederlands</span>
      ) : (
        <Link href={`${basePath}?lang=nl`} className="hover:underline">
          Nederlands
        </Link>
      )}
    </nav>
  );
}
