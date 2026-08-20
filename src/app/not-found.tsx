import Link from "next/link";
import { getMessages } from "@/i18n";

export default function NotFound() {
  const t = getMessages();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-slate-700">{t.notFound.body}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
      >
        {t.notFound.backToShop}
      </Link>
    </div>
  );
}
