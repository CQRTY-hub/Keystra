import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Two jobs. The pathname-forwarding one is original (see below); the
 * Basic Auth gate was added 2026-09-02 for the Vercel testing phase —
 * PLAN.md/the storefront owner's own instruction: the site must not be
 * publicly browsable while pre-launch, and Vercel's Hobby (free) plan
 * can't password-protect a production domain itself (that's a paid Pro
 * feature — confirmed against Vercel's own Deployment Protection docs).
 * This is the free, code-level substitute: every request needs an HTTP
 * Basic Auth username/password before anything else runs.
 *
 * Deliberately OFF unless both SITE_BASIC_AUTH_USER and
 * SITE_BASIC_AUTH_PASSWORD are set — so local dev (where they're never
 * set) behaves exactly as before, and so this doesn't silently start
 * gating things once those env vars are removed again after launch
 * (moving to Scalingo, where the plan is a real reverse-proxy or
 * platform-level gate instead — see the Vercel deployment notes).
 * Values are the storefront owner's own choice, set directly in Vercel
 * — never in this repo, same as every other secret (CLAUDE.md rule 5).
 *
 * Exempts /api/webhooks/mollie: Mollie calls that server-to-server, with
 * no browser session and no way to send a username/password — gating it
 * would silently break every real payment notification. Nothing else is
 * exempt; a browser that already passed the check once has Basic Auth
 * cached by the browser itself for the rest of that browsing session, so
 * this doesn't need to special-case the checkout API, invoice downloads,
 * or anything else a logged-in visitor's own browser calls next.
 *
 * Plain string comparison, not a timing-safe one (contrast with
 * src/lib/admin/password.ts): the threat model here is "keep casual
 * visitors and search engines out before launch," not credential
 * brute-forcing of a real account — and Edge Runtime (where this file
 * runs) doesn't have node:crypto's timingSafeEqual available.
 */
const BASIC_AUTH_EXEMPT_PATHS = ["/api/webhooks/mollie"];

function hasValidBasicAuth(request: NextRequest): boolean {
  const expectedUser = process.env.SITE_BASIC_AUTH_USER;
  const expectedPassword = process.env.SITE_BASIC_AUTH_PASSWORD;
  if (!expectedUser || !expectedPassword) return true; // gate disabled

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return false;
  }
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return user === expectedUser && password === expectedPassword;
}

function basicAuthChallenge(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Keystra"' },
  });
}

/**
 * Forwards the current pathname as a header so src/app/layout.tsx (a
 * Server Component with no other way to know the current route) can
 * tell whether it's rendering an /admin/* page and skip the public
 * header/footer/cookie-consent banner for it — an admin backstage
 * screen shouldn't have the shop's nav and cart icon floating over it.
 * No admin *session* check here, deliberately: Prisma doesn't run on
 * the Edge runtime this runs on, so that validation happens where the
 * database actually is — src/lib/admin/session.ts's requireAdminSession(),
 * called by each protected admin page/action, not here.
 *
 * Named proxy.ts, not middleware.ts — Next.js 16 renamed the convention;
 * the old name still works but logs a deprecation warning.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!BASIC_AUTH_EXEMPT_PATHS.includes(pathname) && !hasValidBasicAuth(request)) {
    return basicAuthChallenge();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/:path*",
};
