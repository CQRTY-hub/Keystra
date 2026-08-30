import Link from "next/link";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

export default function NotFound() {
  const t = getMessages();

  return (
    <div>
      <PageTitleBand title={t.notFound.title} />
      <p className="text-body-md mt-4 text-secondary">{t.notFound.body}</p>
      <Link
        href="/shop"
        className="text-title-sm mt-6 inline-flex items-center justify-center rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
      >
        {t.notFound.backToShop}
      </Link>
    </div>
  );
}
