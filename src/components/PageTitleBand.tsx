import type { ReactNode } from "react";
import { HomeHeroArt } from "@/components/HomeHeroArt";

/**
 * DESIGN.md "Page title band" — every page except the homepage opens with
 * this instead of a bare <h1>. Same HomeHeroArt background as the
 * homepage hero, at a fraction of the height: one recognizable element
 * that recurs everywhere without competing with the actual hero for
 * attention. Renders the page's own (and only) <h1> inside it.
 *
 * `children` is an optional slot for something that used to sit next to
 * the title, e.g. the terms/refund-policy/withdrawal-waiver/guide pages'
 * <LanguageToggle>.
 */
export function PageTitleBand({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-keystra border border-outline">
      <HomeHeroArt />
      <div className="relative z-10 flex items-center justify-between gap-4 px-6 py-5">
        <h1 className="text-headline-md text-on-surface">{title}</h1>
        {children}
      </div>
    </div>
  );
}
