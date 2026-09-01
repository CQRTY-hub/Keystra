import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session";
import { getQuarterlyVatExport, toCsv } from "@/lib/vat-export";

/**
 * Admin-only — requireAdminSession() redirects to /admin/login if
 * there's no valid session, same guard every other protected admin
 * route uses. Query params: ?year=2026&quarter=3.
 */
export async function GET(req: NextRequest) {
  await requireAdminSession();

  const { searchParams } = req.nextUrl;
  const year = Number(searchParams.get("year"));
  const quarter = Number(searchParams.get("quarter"));

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ message: "Invalid or missing year." }, { status: 400 });
  }
  if (![1, 2, 3, 4].includes(quarter)) {
    return NextResponse.json({ message: "Invalid or missing quarter (expected 1-4)." }, { status: 400 });
  }

  const data = await getQuarterlyVatExport(year, quarter as 1 | 2 | 3 | 4);
  const csv = toCsv(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="keystra-vat-${year}-Q${quarter}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
