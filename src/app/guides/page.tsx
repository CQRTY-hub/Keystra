import type { Metadata } from "next";
import Link from "next/link";
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
      <h1 className="text-2xl font-semibold">{t.guidesIndex.title}</h1>
      <p className="mt-2 text-slate-700">{t.guidesIndex.intro}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {GUIDES.map((guide) => (
          <li key={guide.href}>
            <Link href={guide.href} className="underline">
              {t.category[guide.category]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
