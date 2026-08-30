import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { listOrders } from "@/lib/admin/orders";
import { OrderStatus } from "@/lib/order-state-machine";
import { formatPriceCents } from "@/lib/currency";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminOrders,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUSES = Object.values(OrderStatus);

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}

// yyyy-mm-dd from a native <input type="date"> — parsed as local time (not
// UTC midnight) so "27 Aug" means the 27th in the shop owner's own
// timezone, not the day before if they're east of UTC.
function parseDateInput(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  await requireAdminSession();

  const { status, from, to } = await searchParams;
  const statusFilter = status && STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const dateFrom = parseDateInput(from);
  const dateTo = parseDateInput(to);
  const orders = await listOrders({ status: statusFilter, dateFrom, dateTo });

  return (
    <div>
      <h1 className="text-headline-md text-on-surface">{t.admin.orders.title}</h1>

      <form className="mt-4 flex flex-wrap items-end gap-3" aria-label={t.admin.orders.applyFilters}>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-title-sm text-on-surface">
            {t.admin.orders.filterLabel}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          >
            <option value="">{t.admin.orders.filterAll}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-title-sm text-on-surface">
            {t.admin.orders.filterFrom}
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-title-sm text-on-surface">
            {t.admin.orders.filterTo}
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
          />
        </div>
        <button
          type="submit"
          className="text-title-sm rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
        >
          {t.admin.orders.applyFilters}
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="text-body-md mt-8 text-secondary">{t.admin.orders.noResults}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-label-caps border-b border-outline text-secondary">
                <th className="py-2 pr-4 font-normal">{t.admin.orders.columnId}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.orders.columnEmail}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.orders.columnTotal}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.orders.columnStatus}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.orders.columnDate}</th>
                <th className="py-2 font-normal">
                  <span className="sr-only">{t.admin.orders.view}</span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-outline">
                  <td className="py-2 pr-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                  <td className="py-2 pr-4">{order.customerEmail}</td>
                  <td className="py-2 pr-4 tabular-nums">{formatPriceCents(order.totalCents)}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        order.status === "held"
                          ? "text-danger"
                          : "text-secondary"
                      }
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-secondary">
                    {order.createdAt.toLocaleString("en-GB")}
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-secondary underline hover:text-primary"
                    >
                      {t.admin.orders.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
