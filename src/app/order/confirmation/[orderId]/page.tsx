import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/currency";
import { CopyKeyButton } from "@/components/shop/CopyKeyButton";
import { getMessages } from "@/i18n";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic"; // can contain a key — never cache

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const t = getMessages();
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
      <h1 className="text-2xl font-semibold">{t.confirmation.title}</h1>
      <p className="mt-2 text-slate-700">
        {t.confirmation.orderStatus(order.id, order.status)}
      </p>

      {order.status === "held" && (
        <p className="mt-4 rounded border border-slate-300 bg-slate-50 p-4">
          {t.confirmation.heldBody(order.customerEmail)}
        </p>
      )}

      {order.status === "awaiting_code" && (
        <p className="mt-4 rounded border border-slate-300 bg-slate-50 p-4">
          {t.confirmation.awaitingCodeBody(order.customerEmail)}
        </p>
      )}

      {order.status === "completed" && (
        <div className="mt-6">
          <p className="text-slate-700">
            {t.confirmation.completedEmailedTo(order.customerEmail)}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="rounded border border-slate-200 p-4">
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-slate-700">
                  {formatPriceCents(item.unitPriceCents)}
                </p>
                {item.deliveredKeys.map((key) =>
                  key.deliveryMethod === "text" ? (
                    <div
                      key={key.id}
                      className="mt-2 flex flex-wrap items-center gap-2 rounded bg-slate-100 p-2"
                    >
                      <p className="min-w-0 flex-1 break-all font-mono text-sm">
                        {key.value}
                      </p>
                      <CopyKeyButton value={key.value} />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={key.id}
                      src={`data:image/png;base64,${key.value}`}
                      alt={`Key for ${item.product.title}`}
                      className="mt-2 max-w-xs"
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
        <p className="mt-4 text-slate-700">{t.confirmation.processing}</p>
      )}
    </div>
  );
}
