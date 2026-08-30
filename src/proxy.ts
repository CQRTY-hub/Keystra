import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Does exactly one thing: forwards the current pathname as a header so
 * src/app/layout.tsx (a Server Component with no other way to know the
 * current route) can tell whether it's rendering an /admin/* page and
 * skip the public header/footer/cookie-consent banner for it — an admin
 * backstage screen shouldn't have the shop's nav and cart icon floating
 * over it. No auth check here, deliberately: Prisma doesn't run on the
 * Edge runtime this runs on, so session validation happens where the
 * database actually is — src/lib/admin/session.ts's requireAdminSession(),
 * called by each protected admin page/action, not here.
 *
 * Named proxy.ts, not middleware.ts — Next.js 16 renamed the convention;
 * the old name still works but logs a deprecation warning.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/:path*",
};
