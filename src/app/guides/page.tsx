import type { Metadata } from "next";
import Link from "next/link";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = { title: t.pageTitles.guidesIndex };
export const revalidate = 3600;

const GUIDES = [
  { href: "/guides/steam-keys", category: "game_key" as const },
  { href: "/guides/gift-cards", category: "gift_card" as const },
  { href: "/guides/top-up-codes", category: "top_up" as const },
];

export default function GuidesIndexPage() {
  return (
    <div>
      <PageTitleBand title={t.guidesIndex.title} />
      <p className="text-body-md mt-4 text-secondary">{t.guidesIndex.intro}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {GUIDES.map((guide) => (
          <li key={guide.href}>
            <Link
              href={guide.href}
              className="text-title-sm text-secondary underline hover:text-primary"
            >
              {t.category[guide.category]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
