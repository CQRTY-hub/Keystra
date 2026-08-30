import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/currency";
import { CopyButton } from "@/components/shop/CopyButton";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.orderConfirmed,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic"; // can contain a key — never cache

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true, deliveredKeys: true },
      },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <PageTitleBand title={t.confirmation.title} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-body-md text-secondary">{t.confirmation.orderNumberLabel}:</span>
        <span className="text-body-md font-mono text-on-surface">{order.id}</span>
        <CopyButton value={order.id} />
      </div>
      <p className="text-body-md mt-1 text-secondary">
        {t.confirmation.statusLabel(order.status)}
      </p>

      {order.status === "held" && (
        <p className="text-body-md mt-4 rounded-keystra border border-outline bg-container p-4 text-on-surface">
          {t.confirmation.heldBody(order.customerEmail)}
        </p>
      )}

      {order.status === "awaiting_code" && (
        <p className="text-body-md mt-4 rounded-keystra border border-outline bg-container p-4 text-on-surface">
          {t.confirmation.awaitingCodeBody(order.customerEmail)}
        </p>
      )}

      {order.status === "completed" && (
        <div className="mt-6">
          <p className="text-body-md text-secondary">
            {t.confirmation.completedEmailedTo(order.customerEmail)}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="rounded-keystra border border-outline bg-container p-4"
              >
                <p className="text-title-sm text-on-surface">{item.product.title}</p>
                <p className="text-body-md text-secondary">
                  {formatPriceCents(item.unitPriceCents)}
                </p>
                {item.deliveredKeys.map((key) =>
                  key.deliveryMethod === "text" ? (
                    <div
                      key={key.id}
                      className="mt-2 flex flex-wrap items-center gap-2 rounded-keystra border border-outline bg-container-lowest p-2"
                    >
                      <p className="min-w-0 flex-1 break-all font-mono text-sm text-on-surface">
                        {key.value}
                      </p>
                      <CopyButton value={key.value} />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={key.id}
                      src={`data:image/png;base64,${key.value}`}
                      alt={t.confirmation.keyImageAlt(item.product.title)}
                      className="mt-2 max-w-xs rounded-keystra border border-outline"
                    />
                  )
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(order.status === "pending" ||
        order.status === "paid" ||
        order.status === "fulfilling") && (
        <p className="text-body-md mt-4 text-secondary">{t.confirmation.processing}</p>
      )}
    </div>
  );
}
