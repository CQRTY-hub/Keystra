/**
 * Best-effort client IP — used by admin-login rate limiting
 * (src/lib/admin/rate-limit.ts), and by checkout (src/app/api/checkout/route.ts)
 * to capture the IP an order was placed from, which risk assessment
 * (src/lib/fulfillment/codeswholesale-provider.ts's assessRisk()) later
 * requires. `x-forwarded-for` is attacker-controllable on requests that
 * don't actually go through a trusted proxy, but on Vercel (this
 * project's deploy target — PLAN.md) it's set by the platform itself
 * before the request reaches app code, which is the trust boundary this
 * relies on. Never used for anything more sensitive than "which bucket
 * does this rate-limit against" or "what IP to report to a fraud check"
 * — never an access-control decision on its own.
 *
 * Takes a Headers-like object rather than a full Request — Route
 * Handlers have `request.headers`, but Server Actions only get
 * `headers()` from `next/headers` (a ReadonlyHeaders, not a Request), so
 * this accepts whatever has `.get()`, structurally, and works from
 * either call site.
 */
export function getClientIp(requestHeaders: { get(name: string): string | null }): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    // Leftmost entry is the original client; a trusted proxy chain
    // (Vercel's) appends its own hops after it.
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
