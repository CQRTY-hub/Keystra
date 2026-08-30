import type {
  AvailabilityResult,
  FulfillmentProvider,
  KeyResult,
  RiskAssessmentInput,
  RiskAssessmentResult,
} from "./types";

/**
 * Real implementation — Phase 3. The FulfillmentProvider methods below
 * (checkAvailability, orderKey, assessRisk) and their close supporting
 * methods (fetchSupplierInvoice, retrieveCode, checkAccountBalance) now
 * call the real CodesWholesale sandbox. `syncCatalog` is still a stub —
 * see its own comment for why that one specifically isn't just a
 * technical gap. The Complaints API at the bottom is untouched: PLAN.md
 * confirms it isn't even activated in sandbox yet.
 *
 * ## What's actually been run against the sandbox (2026-08-24)
 * `docs.codeswholesale.com` and `codeswholesale.com` both refused/blocked
 * this implementation's automated fetches, so instead of guessing from
 * docs it couldn't reach, every path below except two was exercised for
 * real against the sandbox with a live token — using CodesWholesale's own
 * built-in test products ("Test with text codes only", "Test with image
 * codes only"). Confirmed, with real responses:
 *
 * - `POST /oauth/token` — works as documented.
 * - `GET /v3/products/{productId}` — flat object, not wrapped. Field
 *   names (`productId`, `quantity`, `prices: [{value, from, to}]`) match
 *   exactly. `value` is a decimal amount (e.g. `0.10`), not cents.
 * - `POST /v3/orders` with `{ products: [{ productId, quantity }] }` —
 *   200, places a real (sandbox) order. Response shape is NOT what an
 *   earlier version of this comment guessed — it's
 *   `{ orderId, clientOrderId, status, products: [{ productId, codes: [{
 *   codeType, codeId, code, filename, links }] }] }`. `clientOrderId` in
 *   the request is accepted but was NOT observed being echoed back —
 *   sent anyway (harmless either way) in case it's used server-side.
 *   **CODE_IMAGE's `code` comes back `null` in the order response** —
 *   confirmed the actual base64 only arrives via a follow-up
 *   `GET /v3/codes/{codeId}`, which orderKey() now does automatically.
 *   CODE_PREORDER wasn't reachable (no preorder-type test product
 *   existed to order) — its handling follows the same "code is null,
 *   codeId is present" pattern CODE_IMAGE empirically showed, which is a
 *   reasonable inference, not a directly confirmed CODE_PREORDER response.
 * - `GET /v3/codes/{codeId}` — flat object, same shape as an order's
 *   `codes[]` entry. Confirmed to actually return base64 image data for
 *   CODE_IMAGE.
 * - `GET /v3/accounts/current` — `{ currentBalance, currentCredit,
 *   totalToUse, ... }`; `totalToUse` is already the sum of the other two.
 *
 * **`POST /v3/security` — confirmed directly by CodesWholesale, 2026-08-26**,
 * after four earlier field-name guesses all failed identically. The real
 * body: `customerEmail` and `customerIpAddress` (both required),
 * `customerUserAgent` and `customerPaymentEmail` (both optional).
 * Verified against the live sandbox with a real score returned — see
 * assessRisk() below. `customerPaymentEmail` — the address Mollie
 * actually charged, as opposed to what the shopper typed at checkout —
 * isn't sent yet; Mollie itself is still a stub with no real payer email
 * to report. Wire it in once Phase 3.6 connects a real Mollie account —
 * a mismatch between the two is exactly the fraud signal this field
 * exists for.
 *
 * ## API version
 * The API is v3. v1 and v2 no longer exist.
 *
 * Environments: `sandbox.codeswholesale.com` and `api.codeswholesale.com`
 * are separate hosts. Both come from env vars (CODESWHOLESALE_API_BASE —
 * see .env.example), never hardcoded, and both are set in `.env.local`,
 * never by this codebase. Build and test entirely against sandbox until
 * Phase 3 step 5.
 *
 * ## No postbacks — corrected
 * Earlier notes assumed a postback/webhook for product changes. The
 * published v3 endpoint list has no webhook endpoint — that turned out
 * to be a feature of CodesWholesale's shop plugins, not the API itself.
 * Catalogue sync is polling: `GET /v3/products` with `updatedSince`, on
 * a schedule (see syncCatalog below). This also means product-page
 * revalidation in the running app depends on that sync cadence, not on
 * any push from the supplier — there is nothing to "arrive" here.
 *
 * ## Endpoints and their rate limits (confirmed by CodesWholesale support)
 * - `POST /oauth/token` — 50 requests / 5 min per IP. Client-credentials
 *   grant. With caching (see getAccessToken below) this is roughly one
 *   call per hour, nowhere near the limit.
 * - `GET /v3/products` — full price list. 400 requests / 10 min. The
 *   catalogue sync below only ever asks for the delta, never the full
 *   list on a tight schedule, specifically to stay well under this.
 * - `GET /v3/products/{productId}` — single product. 600 requests / 5
 *   min. This is the one checkAvailability() below calls, at checkout
 *   time only — never on a page view.
 * - `POST /v3/security` — risk score. Rate limit not yet confirmed with
 *   support (see PLAN.md, "Still to confirm").
 * - `GET /v3/orders/{orderId}/invoice`, `GET /v3/codes/{codeId}`,
 *   `GET /v3/platforms`, `GET /v3/regions`, `GET /v3/territory`,
 *   `GET /v3/languages`, `GET /v3/products/{productId}/description`,
 *   `GET /v3/productImages/{id}`, `GET /v3/accounts/current` — rate
 *   limits not published for any of these; confirm before relying on a
 *   call volume for them.
 * - The Complaints API (see the bottom of this file) — genuinely separate
 *   from everything above: its own docs (read in full, 2026-08-24 — see
 *   that section), and its own rate limit, now published: only ONE
 *   complaint-creation request per client at a time; a concurrent second
 *   one is rejected with `TOO_MANY_REQUESTS` (429). Not the same base
 *   path as everything above, and — unlike everything above — it only
 *   exists on live, never in sandbox.
 *
 * ## No webhook for low balance
 * Those warnings go by email only (PLAN.md, Phase 0.5). checkAccountBalance()
 * below fetches the figure; deciding what "low" means and actually
 * raising the alert is Phase 3.5 work (the daily spend ceiling and
 * auto-pause circuit breaker) — nothing here decides that, and orderKey()
 * deliberately does NOT call checkAccountBalance() automatically yet —
 * see the comment inside orderKey for why.
 *
 * ## Reminders from PLAN.md that apply specifically here
 * - Pricing is tiered by quantity — for one-key-at-a-time fulfilment,
 *   price against the top (most expensive) band, not a blended one.
 * - Faulty keys are NOT an API operation. Never issue a replacement or a
 *   refund from this class — that's the manual support-form path
 *   (reportable up to 1 year post-purchase, up to 14 business days for
 *   CodesWholesale to resolve). See mock-provider.ts's faultyKey
 *   scenario for the fixture the future claim path tests against.
 * - Never duplicate or re-issue a key from this provider. One key, one
 *   order, always.
 */
export class CodesWholesaleProvider implements FulfillmentProvider {
  async checkAvailability(productId: string): Promise<AvailabilityResult> {
    let product: CwProductResponse;
    try {
      product = await cwFetch<CwProductResponse>(`/v3/products/${productId}`);
    } catch (err) {
      if (err instanceof CodesWholesaleApiError && err.status === 404) {
        // Product doesn't exist (or is no longer sold) at the supplier —
        // that's "not available", not an application error.
        return { available: false, priceCents: 0 };
      }
      throw err;
    }

    return {
      available: product.quantity > 0,
      priceCents: topPriceBandCents(product.prices),
    };
  }

  async orderKey(productId: string, orderId: string): Promise<KeyResult> {
    // Deliberately NOT calling checkAccountBalance() before/after here,
    // even though an earlier version of this TODO said to. There's
    // nowhere in the app yet for that figure to go once fetched — no
    // alerting exists (that's Phase 3.5's circuit breaker), and this
    // method's return type is KeyResult, not something that could carry
    // a balance reading out. Calling it and discarding the result
    // wouldn't accomplish anything; wire it in when Phase 3.5 gives it
    // somewhere real to go. Same reasoning for fetchSupplierInvoice() —
    // implemented below and ready to call, but not called automatically
    // yet because there's no schema field to file the result under.
    let response: CwOrderResponse;
    try {
      response = await cwFetch<CwOrderResponse>("/v3/orders", {
        method: "POST",
        // clientOrderId = our own internal Order.id, deliberately sent on
        // every order (storefront owner, 2026-08-24) — without it, a
        // future Complaints API submission (see submitComplaint() at the
        // bottom of this file) has no reliable way to tie a
        // CodesWholesale order back to the Keystra order it belongs to.
        // Confirmed accepted by the sandbox (200 OK either way), but NOT
        // observed being echoed back in the response's own clientOrderId
        // field — so don't rely on reading it back from an order response
        // to confirm it was stored; it may only surface via the
        // Complaints API or CodesWholesale's own dashboard.
        body: JSON.stringify({
          products: [{ productId, quantity: 1 }],
          clientOrderId: orderId,
        }),
        timeoutMs: ORDER_TIMEOUT_MS,
      });
    } catch (err) {
      if (err instanceof CodesWholesaleTimeoutError) {
        return {
          status: "failed",
          reason: "timeout",
          message: `CodesWholesale order request timed out after ${ORDER_TIMEOUT_MS}ms.`,
        };
      }
      if (err instanceof CodesWholesaleApiError) {
        // Exact error status/body CodesWholesale actually returns for
        // "out of stock" vs. "insufficient balance" at order time isn't
        // confirmed — this mapping is a best guess. Watch the real
        // sandbox response the first time this path is exercised for
        // real and correct these status codes if they're wrong.
        if (err.status === 409 || err.status === 422) {
          return {
            status: "failed",
            reason: "out_of_stock",
            message: `CodesWholesale order failed (${err.status}): out of stock or no longer sold.`,
          };
        }
        if (err.status === 402) {
          return {
            status: "failed",
            reason: "empty_balance",
            message: `CodesWholesale order failed (${err.status}): supplier account balance is empty.`,
          };
        }
      }
      return {
        status: "failed",
        reason: "unknown",
        message: err instanceof Error ? err.message : String(err),
      };
    }

    // Confirmed shape: an order's product line carries a `codes` array
    // (one entry per unit ordered — quantity is always 1 here), not a
    // single flat item. See resolveOrderCode() for what happens per type.
    const code = response.products?.[0]?.codes?.[0];
    if (!code) {
      return {
        status: "failed",
        reason: "unknown",
        message: `CodesWholesale order ${response.orderId ?? "(no orderId)"} for internal order ${orderId} returned no code.`,
      };
    }

    return resolveOrderCode(code);
  }

  async assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    // Confirmed request shape — see this file's header comment.
    // customerEmail and customerIpAddress are mandatory; the other two
    // are omitted entirely when absent rather than sent as undefined —
    // CodesWholesale's earlier "Parameters not provided" error suggests
    // it may be strict about unrecognized/empty fields.
    const response = await cwFetch<CwSecurityResponse>("/v3/security", {
      method: "POST",
      body: JSON.stringify({
        customerEmail: input.customerEmail,
        customerIpAddress: input.customerIpAddress,
        ...(input.customerUserAgent ? { customerUserAgent: input.customerUserAgent } : {}),
        ...(input.customerPaymentEmail
          ? { customerPaymentEmail: input.customerPaymentEmail }
          : {}),
      }),
    });

    return {
      riskScore: response.riskScore,
      suggestedHoldThreshold: CODESWHOLESALE_SUGGESTED_HOLD_THRESHOLD,
    };
  }

  /**
   * `GET /v3/orders/{orderId}/invoice`. Purchase-side bookkeeping (what I
   * pay CodesWholesale), separate from and not a substitute for the
   * Belgian-compliant customer invoice built in Phase 3.6. Not called
   * automatically by orderKey() yet — see that method's comment; call it
   * yourself once there's a place to store the result.
   */
  async fetchSupplierInvoice(supplierOrderId: string): Promise<unknown> {
    return cwFetch(`/v3/orders/${supplierOrderId}/invoice`);
  }

  /**
   * `GET /v3/codes/{codeId}` — resolves an order sitting in
   * `awaiting_code`: the codeId comes from the CODE_PREORDER response
   * orderKey() got at order time (OrderItem.pendingCodeId). Not part of
   * FulfillmentProvider today — nothing in the app yet polls or resolves
   * awaiting_code orders (no scheduled job exists for it; see the big
   * TODO comment above the token-management section below for what that
   * job needs to do). Add this to the shared interface when that
   * resolution path gets built, so the mock can simulate it too.
   */
  async retrieveCode(codeId: string): Promise<KeyResult> {
    const code = await cwFetch<CwOrderCode>(`/v3/codes/${codeId}`);
    return resolveOrderCode(code);
  }

  /**
   * `GET /v3/accounts/current` — current balance including credit. No
   * webhook for this (PLAN.md: "those warnings go by email only"), so
   * it's polled. Deliberately returns just the raw figure — deciding
   * what counts as "low" and actually raising the alert is Phase 3.5's
   * daily spend ceiling / auto-pause circuit breaker, not this method's
   * job.
   */
  async checkAccountBalance(): Promise<{ balanceCents: number }> {
    const account = await cwFetch<CwAccountResponse>("/v3/accounts/current");
    // ASSUMPTION, not confirmed against a live response: `totalToUse`,
    // when present, already IS balance + credit combined — the Go SDK
    // this was cross-checked against has all three fields but doesn't
    // document their exact relationship. Falls back to summing balance
    // and credit if totalToUse is absent. Verify against the sandbox.
    const total = account.totalToUse ?? account.currentBalance + account.currentCredit;
    return { balanceCents: Math.round(total * 100) };
  }
}

/**
 * TODO(Phase 3): the `awaiting_code` resolution job — does not exist yet.
 * This is the piece that actually closes the loop this file's
 * retrieveCode() and OrderItem.pendingCodeId (schema.prisma) were built
 * for. Without it, an order can sit in `awaiting_code` forever: paid,
 * valid, and with no customer-facing way to ever get the key.
 *
 * Scheduled job, same reasoning as syncCatalog/syncReferenceData below —
 * there's no push for this, only polling:
 *
 * 1. Find every `OrderItem` with a non-null `pendingCodeId` whose `Order`
 *    is still `awaiting_code`.
 * 2. Call `retrieveCode(pendingCodeId)` for each, via `getAccessToken()`
 *    (now implemented — see below).
 * 3. On a real key: write the `DeliveredKey` row FIRST, exactly like the
 *    webhook route does today — non-negotiable #1 (never show or email a
 *    key before it's in the database) applies here just as much as it
 *    does to the original order flow. Only after that write succeeds,
 *    clear `pendingCodeId` and move the order to `completed` via
 *    `assertTransition` (never a raw status write). Log through
 *    `logEvent()`, same as everywhere else.
 * 4. Still no code back: leave it — do not fail the order, do not retry
 *    into a `held` state on its own. Next run tries again.
 * 5. **Alert on staleness.** A `pendingCodeId` that's been open longer
 *    than some threshold (start conservative — a day or two — and tune
 *    from real data, same spirit as the fulfilment-failure circuit
 *    breaker in Phase 3.5) needs its own log line and an alert to the
 *    owner, not just silence. A paid customer with no key for days is a
 *    support ticket and a chargeback waiting to happen, and nothing else
 *    in the system will notice on its own — this job is the only thing
 *    watching that clock.
 */

// ---------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------
// Confirmed directly against the sandbox (2026-08-24) with a live token
// and CodesWholesale's own test products — see this file's header
// comment for exactly what was and wasn't verified this way.

interface CwPriceBand {
  value: number;
  from: number;
  to: number | null;
}

interface CwProductResponse {
  productId: string;
  quantity: number;
  prices: CwPriceBand[];
}

/** One entry in an order's (or GET /v3/codes/{codeId}'s) `codes` array. */
interface CwOrderCode {
  codeType: "CODE_TEXT" | "CODE_IMAGE" | "CODE_PREORDER";
  codeId: string;
  /**
   * The actual value — present for CODE_TEXT immediately. Confirmed
   * `null` for CODE_IMAGE in the order-creation response specifically;
   * resolveOrderCode() below fetches it via codeId when that happens.
   */
  code: string | null;
  /** Lowercase in the real response, not `fileName`. Empty string, not
   *  absent, when there's nothing to name (e.g. CODE_TEXT). */
  filename: string;
  links: { rel: string; href: string }[];
}

interface CwOrderProductLine {
  productId: string;
  codes: CwOrderCode[];
}

interface CwOrderResponse {
  orderId: string;
  clientOrderId: string | null;
  status: string;
  products: CwOrderProductLine[];
}

interface CwSecurityResponse {
  riskScore: number;
}

interface CwAccountResponse {
  currentBalance: number;
  currentCredit: number;
  /** Confirmed to already be currentBalance + currentCredit combined. */
  totalToUse?: number;
}

/**
 * Pricing is tiered by quantity (PLAN.md, Phase 0.5) — for one-key-at-a-
 * time fulfilment, price against the top (most expensive, lowest-quantity)
 * band, not a blended one. `value` confirmed to be a decimal amount in
 * the account's currency (e.g. `0.10`), not already cents.
 */
function topPriceBandCents(prices: CwPriceBand[]): number {
  if (prices.length === 0) return 0;
  const top = prices.reduce((highest, band) => (band.value > highest.value ? band : highest));
  return Math.round(top.value * 100);
}

/**
 * Shared by orderKey() and retrieveCode() — same entry shape either way.
 * CODE_IMAGE needs a second round-trip: confirmed against the sandbox
 * that an order's own response carries `code: null` for images, and the
 * actual base64 only comes back from a follow-up GET /v3/codes/{codeId}.
 * CODE_TEXT is defensively given the same fallback in case a future
 * order type behaves the same way, even though it wasn't observed to
 * need it.
 */
async function resolveOrderCode(code: CwOrderCode): Promise<KeyResult> {
  switch (code.codeType) {
    case "CODE_TEXT": {
      const value = code.code ?? (await cwFetch<CwOrderCode>(`/v3/codes/${code.codeId}`)).code;
      if (!value) {
        throw new Error(`CodesWholesale CODE_TEXT ${code.codeId} has no code value.`);
      }
      return { status: "delivered", codeType: "CODE_TEXT", value };
    }

    case "CODE_IMAGE": {
      const value = code.code ?? (await cwFetch<CwOrderCode>(`/v3/codes/${code.codeId}`)).code;
      if (!value) {
        throw new Error(`CodesWholesale CODE_IMAGE ${code.codeId} has no image data.`);
      }
      return {
        status: "delivered",
        codeType: "CODE_IMAGE",
        valueBase64: value,
        fileName: code.filename,
      };
    }

    case "CODE_PREORDER":
      // Not directly confirmed — see this file's header comment. Follows
      // the same "code is null, codeId is present" pattern CODE_IMAGE
      // empirically showed.
      return { status: "awaiting_code", codeType: "CODE_PREORDER", codeId: code.codeId };

    default:
      throw new Error(`CodesWholesale returned an unknown codeType: "${code.codeType}".`);
  }
}

/** PLAN.md, Phase 0.5: "1.5 as their suggested value." */
const CODESWHOLESALE_SUGGESTED_HOLD_THRESHOLD = 1.5;

const ORDER_TIMEOUT_MS = 15_000;
const DEFAULT_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------
// Low-level HTTP
// ---------------------------------------------------------------------

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local (see .env.example) — ` +
        "never hardcode CodesWholesale credentials in this codebase."
    );
  }
  return value;
}

function apiBase(): string {
  return requiredEnv("CODESWHOLESALE_API_BASE").replace(/\/+$/, "");
}

export class CodesWholesaleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "CodesWholesaleApiError";
  }
}

export class CodesWholesaleTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodesWholesaleTimeoutError";
  }
}

/**
 * Authenticated JSON fetch against the CodesWholesale v3 API. Every real
 * call in this file goes through here — never call fetch() directly
 * elsewhere in this module. Handles the bearer token, the base URL, JSON
 * parsing, and turning a non-2xx response into CodesWholesaleApiError
 * (never a raw, unhandled fetch rejection).
 */
async function cwFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const token = await getAccessToken();
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init ?? {};

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...rest,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...rest.headers,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new CodesWholesaleTimeoutError(
        `CodesWholesale ${rest.method ?? "GET"} ${path} timed out after ${timeoutMs}ms.`
      );
    }
    throw err;
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // Non-JSON error body — leave body null, the status still tells the story.
    }
    throw new CodesWholesaleApiError(
      `CodesWholesale ${rest.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}`,
      res.status,
      body
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------
//
// Confirmed by CodesWholesale support: requesting a new token while the
// current one is still valid returns the SAME token with its remaining
// life — so over-requesting doesn't rotate anything, but it does waste a
// call against the 50/5min limit and add latency for no reason.
//
// Token lifetime is dynamic — read `expires_in` from the response, never
// hardcode a lifetime. Support said 60 minutes, but the documentation's
// own example response shows 1158 seconds (because re-requesting returns
// the existing token with its *remaining* life, not a fresh full term).
// The rule this is built around: derive expiresAt from whatever
// expires_in actually comes back, store it, and only request a new token
// once that derived time has genuinely passed.
//
// This module-level cache is enough for local dev and for exercising the
// sandbox, but PLAN.md is explicit: "Store the token in the database, not
// in session." A module-level variable does not survive across separate
// serverless function instances on Vercel — production needs to persist
// { accessToken, expiresAt } somewhere shared (a DB table), not rely on
// this in-memory shape surviving between requests. Not done here — no
// such table exists yet, and adding one is a schema decision, not
// something to slip into a fulfillment-provider change.

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms, derived from the response's expires_in
}

let cachedToken: CachedToken | null = null;

/** Safety margin so a token already in flight doesn't expire mid-request. */
const TOKEN_EXPIRY_SAFETY_MARGIN_MS = 60_000;

/**
 * Pure and exported specifically so it's testable without a network call
 * or a real clock — see tests/codeswholesale-token-cache.test.ts.
 */
export function isTokenStillValid(
  expiresAt: number,
  now: number,
  safetyMarginMs: number = TOKEN_EXPIRY_SAFETY_MARGIN_MS
): boolean {
  return expiresAt - now > safetyMarginMs;
}

/**
 * Returns the cached token if it's still valid, otherwise fetches a new
 * one. Every authenticated call in this class should go through this —
 * never call fetchNewToken() directly.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && isTokenStillValid(cachedToken.expiresAt, Date.now())) {
    return cachedToken.accessToken;
  }
  return fetchNewToken();
}

interface CwTokenResponse {
  access_token: string;
  expires_in: number;
}

async function fetchNewToken(): Promise<string> {
  const clientId = requiredEnv("CODESWHOLESALE_CLIENT_ID");
  const clientSecret = requiredEnv("CODESWHOLESALE_CLIENT_SECRET");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${apiBase()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!res.ok) {
    // Never log the response body here — on some error paths an OAuth
    // endpoint echoes request params back, which could include the
    // client secret. The status and statusText are enough to diagnose a
    // bad client_id/client_secret pair without risking that.
    throw new Error(
      `CodesWholesale token request failed: ${res.status} ${res.statusText}. ` +
        "Check CODESWHOLESALE_CLIENT_ID / CODESWHOLESALE_CLIENT_SECRET in .env.local."
    );
  }

  const data = (await res.json()) as CwTokenResponse;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

// ---------------------------------------------------------------------
// Catalogue caching
// ---------------------------------------------------------------------
//
// PLAN.md, Phase 1 ("Rendering") and Phase 0.5 are both explicit: the
// shop's own pages never call the supplier live — they read Product
// rows from our own database. checkAvailability() above is the one
// exception, called only at checkout time for one product, which is
// what the 600/5min single-product limit is sized for.
//
// Keeping that DB catalogue in sync is a separate, out-of-band job —
// not part of the FulfillmentProvider interface, since it doesn't run
// per-request. There is no push mechanism (see "No postbacks" above):
// this has to be a scheduled poll, not a webhook handler.

/**
 * STILL A STUB — and deliberately so, unlike the rest of this file. The
 * HTTP call itself (GET /v3/products with createdSince/updatedSince) is
 * the easy part; what's actually missing is a curation decision this
 * file shouldn't make unilaterally: when a product upserts into `Product`
 * by supplierProductId for the first time, what do `title`, `category`,
 * `region`, and `priceCents` become? Those are all NOT NULL columns, and
 * Phase 3.5 (admin pricing/curation, per PLAN.md) is exactly where that
 * mapping — including the margin rule that turns supplier cost into
 * Product.priceCents — gets decided. Auto-creating live, unpriced,
 * uncurated Product rows straight from the supplier feed risks listing
 * something wrong on the actual storefront, which is a product-
 * correctness problem, not just an unfinished feature. Build this once
 * Phase 3.5's pricing rule exists to feed it, not before.
 */
export async function syncCatalog(_since: {
  createdSince?: Date;
  updatedSince?: Date;
}): Promise<void> {
  throw new Error(
    "CodesWholesaleProvider.syncCatalog is intentionally still a stub — see the comment above it."
  );
}

/**
 * `GET /v3/platforms`, `/v3/regions`, `/v3/territory`, `/v3/languages`.
 * The shop's platform and region filters (currently just derived from
 * whatever's in the Product table — see src/app/shop/page.tsx) should
 * eventually be built from this reference data, cached locally, never
 * hardcoded — hardcoding a region list is how the shop ends up claiming
 * to sell a region it can't actually supply. Returns the fetched data
 * rather than caching it: there's no schema table for it yet, so caching
 * is still a TODO for whoever wires this into the shop's filters.
 */
export async function syncReferenceData(): Promise<{
  platforms: unknown;
  regions: unknown;
  territories: unknown;
  languages: unknown;
}> {
  const [platforms, regions, territories, languages] = await Promise.all([
    cwFetch("/v3/platforms"),
    cwFetch("/v3/regions"),
    cwFetch("/v3/territory"),
    cwFetch("/v3/languages"),
  ]);
  return { platforms, regions, territories, languages };
}

/**
 * `GET /v3/products/{productId}/description` and
 * `GET /v3/productImages/{id}`. Product copy and images for product
 * pages — the Product model doesn't have fields for either yet; that's a
 * schema change to make when this actually gets wired into a page, not
 * here.
 */
export async function fetchProductContent(productId: string): Promise<{
  description: unknown;
  images: unknown;
}> {
  const [description, images] = await Promise.all([
    cwFetch(`/v3/products/${productId}/description`),
    cwFetch(`/v3/productImages/${productId}`),
  ]);
  return { description, images };
}

// ---------------------------------------------------------------------
// Complaints API
// ---------------------------------------------------------------------
//
// Genuinely separate from everything above — own docs, own base path
// (still `<url>/v3/...`, but a different resource family), same OAuth
// client-credentials auth (the SAME client_id/client_secret as the rest
// of this file — getAccessToken() below applies here too — they just
// have to be whitelisted for these specific endpoints first). Real spec
// read in full, 2026-08-24 (complaint_api_doc.html, supplied by the
// storefront owner). Still not implemented — see below — but every shape
// here is the documented one, not a guess.
//
// **Access is whitelist-only.** Request it from
// devteam@codeswholesale.com specifically — not the general support
// address used for everything else in this file. And unlike every other
// endpoint in this file, **the Complaints API's documented base URL is
// `https://api.codeswholesale.com` only — the docs never mention a
// sandbox host for it.** There is nothing to test this against until the
// shop is live. Not implemented in this pass for exactly that reason.
// That access request belongs on the go-live checklist (PLAN.md's own
// words: "exactly the kind of task that gets forgotten until the first
// faulty key arrives") — not something to chase down now.
//
// **Rate limit:** only one complaint-creation request per client at a
// time. A concurrent second one is rejected with a 429
// (`TOO_MANY_REQUESTS`) — queue submissions, don't fire them in parallel.
//
// **The non-obvious catch: the "orderId" these endpoints take is OUR
// clientOrderId, not CodesWholesale's own order ID.** The docs' own
// worked example proves it: an order is created with
// `clientOrderId: "ORD-123456"`; the complaint-creation example then
// submits `{ "orderId": "ORD-123456", ... }` (the client value, not
// CodesWholesale's internal one); and `GET /v3/complaints/order/ORD-123456`
// correctly returns it — with the response itself showing CodesWholesale's
// *actual* internal order id separately, as `"orderId": "order_3308_1"`.
// So: submitComplaint()'s `orderId` param below must be filled with our
// own `Order.id` — exactly what orderKey() above now sends as
// `clientOrderId` when placing the order (storefront owner, 2026-08-24).
// Skip sending that at order time and there is no way to find this
// order's complaints again through this API at all.
//
// What this API is deliberately NOT for: resolving a faulty-key claim
// automatically. PLAN.md and CLAUDE.md are both explicit that the
// support widget must never resolve a faulty-key claim, ever — that
// judgment call stays human, always. Every function here only ever gets
// called from the Phase 3.5 admin, on someone actually clicking a
// button — never from an automated job, never from anything a customer
// interaction can trigger on its own.

/** `reason` must be exactly one of these (case-sensitive). "Region Lock" requires `region`. */
export type CwComplaintReason =
  | "Invalid"
  | "Used"
  | "Region Lock"
  | "Wrong game"
  | "Not clear"
  | "Other";

interface CwComplaintScreenshot {
  /** Must include an extension matching contentType (e.g. "screenshot.png"). */
  filename: string;
  /** "image/png", "image/jpeg", or "image/jpg" — no other formats accepted. */
  contentType: string;
  /** Base64. A "data:image/png;base64," prefix is accepted and stripped
   *  automatically. Max 10MB after decoding. PLAN.md's four-screenshot
   *  policy means this gets called multiple times per claim, once per
   *  screenshot — the API takes one screenshot per complaint entry, not
   *  an array of them. */
  data: string;
}

interface CwComplaintEntry {
  productId: string;
  codeType: "CODE_TEXT" | "CODE_IMAGE";
  /** Required when codeType is CODE_TEXT (max 200 chars). */
  code?: string;
  /** Required when codeType is CODE_IMAGE (max 200 chars). */
  codeFilename?: string;
  reason: CwComplaintReason;
  /** Required when reason is "Region Lock" (max 50 chars). */
  region?: string;
  /** Optional, max 200 chars. */
  comment?: string;
  screenshot: CwComplaintScreenshot;
}

interface CwComplaintSubmissionResult {
  /** The code or filename this result line is about. */
  codeValue: string;
  productId: string;
  /** Per-entry HTTP-style status — the outer call is 200 even when this isn't. */
  status: number;
  message: string;
  /** null only if this specific entry failed outright before an ID was assigned. */
  complaintId: number | null;
}

interface CwComplaint {
  complaintId: number;
  /** CodesWholesale's own internal order id — NOT what you filed the complaint under. */
  orderId: string | null;
  /** Our own Order.id, if it was sent as clientOrderId at order-creation time. */
  clientOrderId: string | null;
  productId: string;
  productName: string;
  codeCount: number;
  reason: CwComplaintReason;
  status: string;
  solution: string | null;
  createdDate: string;
  completionDate: string | null;
  lastUpdateDate: string | null;
  codes: string[];
}

/**
 * TODO(Phase 3.5, gated on CodesWholesale whitelisting access — see
 * above): `POST /v3/complaints`. `orderId` here is OUR OWN Order.id (the
 * same value orderKey() sends as clientOrderId), not CodesWholesale's —
 * see the file-section comment above for why. A `status` of 409 on an
 * individual result means a complaint already exists for that code
 * (`complaintId` still comes back — that's the existing one, not an
 * error to retry). Screenshot validation happens before any complaint in
 * the batch is created — one bad screenshot can fail the whole request;
 * see complaint_api_doc.html Section 6 for the specific error codes.
 */
export async function submitComplaint(_input: {
  orderId: string;
  complaints: CwComplaintEntry[];
}): Promise<{ responses: CwComplaintSubmissionResult[] }> {
  throw new Error(
    "CodesWholesaleProvider.submitComplaint is not implemented yet — gated on CodesWholesale whitelisting access, requested from devteam@codeswholesale.com."
  );
}

/**
 * TODO(Phase 3.5): `GET /v3/complaints/order/{orderId}` — again, our own
 * Order.id (the clientOrderId sent at order time), not CodesWholesale's
 * internal one. Empty `complaints` array if none exist for that order —
 * not a 404. This is what lets a specific order's open claims surface on
 * the Phase 3.5 admin instead of being tracked by hand.
 */
export async function getComplaintsForOrder(
  _orderId: string
): Promise<{ complaints: CwComplaint[] }> {
  throw new Error(
    "CodesWholesaleProvider.getComplaintsForOrder is not implemented yet — gated on CodesWholesale whitelisting access, requested from devteam@codeswholesale.com."
  );
}

/**
 * TODO(Phase 3.5): `GET /v3/complaints` — every complaint this client has
 * ever filed, newest first. Same response shape as getComplaintsForOrder()
 * above. Useful for a dashboard-wide "open claims" view rather than
 * looking them up order by order.
 */
export async function getAllComplaints(): Promise<{ complaints: CwComplaint[] }> {
  throw new Error(
    "CodesWholesaleProvider.getAllComplaints is not implemented yet — gated on CodesWholesale whitelisting access, requested from devteam@codeswholesale.com."
  );
}
