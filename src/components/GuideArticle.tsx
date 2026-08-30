import type { ContentLocale } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PageTitleBand } from "@/components/PageTitleBand";

interface GuideContent {
  title: string;
  intro: string;
  steps: readonly string[];
  notes: readonly string[];
}

/** Shared shape for the three redemption guides — same structure, different content. */
export function GuideArticle({
  guide,
  locale,
  basePath,
}: {
  guide: GuideContent;
  locale: ContentLocale;
  basePath: string;
}) {
  return (
    <article className="max-w-3xl">
      <PageTitleBand title={guide.title}>
        <LanguageToggle current={locale} basePath={basePath} />
      </PageTitleBand>
      <p className="text-body-md mt-4 text-secondary">{guide.intro}</p>

      <ol className="text-body-md mt-6 list-decimal space-y-2 pl-5 text-on-surface">
        {guide.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <ul className="text-body-md mt-6 list-disc space-y-2 pl-5 text-secondary">
        {guide.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </article>
  );
}
