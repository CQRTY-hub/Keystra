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
    <nav aria-label={t.languageToggle.ariaLabel} className="text-body-md flex gap-3">
      {current === "en" ? (
        <span className="text-on-surface underline">English</span>
      ) : (
        <Link href={basePath} className="text-secondary hover:text-primary hover:underline">
          English
        </Link>
      )}
      {current === "nl" ? (
        <span className="text-on-surface underline">Nederlands</span>
      ) : (
        <Link
          href={`${basePath}?lang=nl`}
          className="text-secondary hover:text-primary hover:underline"
        >
          Nederlands
        </Link>
      )}
    </nav>
  );
}
