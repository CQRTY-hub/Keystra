import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import { listProductsForAdmin } from "@/lib/admin/products";
import {
  toggleProductActiveAction,
  refreshProductCostAction,
} from "@/lib/actions/admin-panel-actions";
import { formatPriceCents } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminProducts,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminSession();

  const products = await listProductsForAdmin();

  return (
    <div>
      <h1 className="text-headline-md text-on-surface">{t.admin.products.title}</h1>

      {products.length === 0 ? (
        <p className="text-body-md mt-8 text-secondary">{t.admin.products.noProducts}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-label-caps border-b border-outline text-secondary">
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnTitle}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnCategory}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnRegion}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnCost}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnPrice}</th>
                <th className="py-2 pr-4 font-normal">{t.admin.products.columnMargin}</th>
                <th className="py-2 font-normal">{t.admin.products.columnActive}</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface">
              {products.map((product) => {
                const hasCost = product.costCentsSnapshot !== null;
                const marginCents = hasCost
                  ? product.priceCents - product.costCentsSnapshot!
                  : null;
                const toggleAction = toggleProductActiveAction.bind(
                  null,
                  product.id,
                  !product.active
                );
                const refreshAction = refreshProductCostAction.bind(null, product.id);

                return (
                  <tr key={product.id} className="border-b border-outline align-top">
                    <td className="py-3 pr-4">{product.title}</td>
                    <td className="py-3 pr-4">
                      <Badge>{t.category[product.category]}</Badge>
                    </td>
                    <td className="py-3 pr-4">{product.region}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="tabular-nums">
                          {hasCost
                            ? formatPriceCents(product.costCentsSnapshot!)
                            : t.admin.products.costUnknown}
                        </span>
                        {product.costSnapshotAt && (
                          <span className="text-label-caps text-secondary">
                            {t.admin.products.costAsOf(product.costSnapshotAt.toLocaleDateString("en-GB"))}
                          </span>
                        )}
                        <form action={refreshAction}>
                          <button
                            type="submit"
                            className="text-label-caps text-secondary underline hover:text-primary"
                          >
                            {t.admin.products.refreshCost}
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{formatPriceCents(product.priceCents)}</td>
                    <td className="py-3 pr-4 tabular-nums">
                      {marginCents === null ? "—" : formatPriceCents(marginCents)}
                    </td>
                    <td className="py-3">
                      <form action={toggleAction}>
                        <Button type="submit" variant="secondary">
                          {product.active ? t.admin.products.deactivate : t.admin.products.activate}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
