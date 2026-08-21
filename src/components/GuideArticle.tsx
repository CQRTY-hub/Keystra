import type { ContentLocale } from "@/i18n/content-locale";
import { LanguageToggle } from "@/components/LanguageToggle";

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{guide.title}</h1>
        <LanguageToggle current={locale} basePath={basePath} />
      </div>
      <p className="mt-2 text-slate-700">{guide.intro}</p>

      <ol className="mt-6 list-decimal space-y-2 pl-5 text-slate-700">
        {guide.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-600">
        {guide.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </article>
  );
}
