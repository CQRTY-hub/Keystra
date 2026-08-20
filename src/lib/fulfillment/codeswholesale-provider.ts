import type {
  AvailabilityResult,
  FulfillmentProvider,
  KeyResult,
  RiskAssessmentInput,
  RiskAssessmentResult,
} from "./types";

/**
 * Real implementation — Phase 3, not before. Every method below still
 * throws; nothing here calls the real API yet. Build against the
 * CodesWholesale sandbox once Phase 3 actually starts.
 *
 * ## API version
 * The API is v3. v1 and v2 no longer exist — every endpoint referenced
 * below and in the TODOs is v3. Verify each path against the *current*
 * docs before implementing; PLAN.md itself warns some published
 * material predates the v3 move.
 *
 * Environments: `sandbox.codeswholesale.com` and `api.codeswholesale.com`
 * are separate hosts. Both come from env vars (CODESWHOLESALE_API_BASE —
 * see .env.example), never hardcoded, and both are set in `.env.local`,
 * never in code. Build and test entirely against sandbox until Phase 3
 * step 5.
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
 *   `GET /v3/productImages/{id}` — rate limits not published for any of
 *   these; confirm before relying on a call volume for them.
 * - Order placement — exact v3 path not yet confirmed against current
 *   docs (PLAN.md doesn't give it). Verify before implementing orderKey.
 *
 * ## Reminders from PLAN.md that apply specifically here
 * - Pricing is tiered by quantity — for one-key-at-a-time fulfilment,
 *   price against the top (most expensive) band, not a blended one.
 * - Faulty keys are NOT an API operation. Never issue a replacement or a
 *   refund from this class — that's the manual support-form path
 *   (reportable up to 1 year post-purchase, up to 14 business days for
 *   CodesWholesale to resolve). See mock-provider.ts's faultyKey
 *   scenario for the fixture the future claim path tests against. No
 *   complaint endpoint appears in the v3 list despite support mentioning
 *   one — follow up before building that part.
 * - Never duplicate or re-issue a key from this provider. One key, one
 *   order, always.
 */
export class CodesWholesaleProvider implements FulfillmentProvider {
  async checkAvailability(_productId: string): Promise<AvailabilityResult> {
    // TODO(Phase 3): GET /v3/products/{productId} against the sandbox,
    // authenticated via getAccessToken() below. Read the live `quantity`
    // and the top price band (see PLAN.md: pricing is tiered, price
    // against the band actually bought — the top one, for single-key
    // fulfilment).
    throw new Error("CodesWholesaleProvider is not implemented yet.");
  }

  async orderKey(_productId: string, _orderId: string): Promise<KeyResult> {
    // TODO(Phase 3): POST an order against /v3/... (confirm exact path
    // and request shape against current docs first — not given in
    // PLAN.md). Map the response's code type (CODE_TEXT / CODE_IMAGE /
    // CODE_PREORDER) onto KeyResult — do not collapse CODE_PREORDER into
    // a failure, it's a valid "awaiting_code" outcome. On success, also
    // call fetchSupplierInvoice() below for this order — PLAN.md wants
    // the supplier invoice pulled and filed automatically, not by hand.
    throw new Error("CodesWholesaleProvider is not implemented yet.");
  }

  async assessRisk(_input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    // TODO(Phase 3): POST /v3/security, authenticated via
    // getAccessToken(). Confirm the exact request body against current
    // docs — PLAN.md confirms the response shape (a numeric riskScore)
    // but not what the request needs to carry. CodesWholesale's own
    // suggested hold threshold is 1.5 (PLAN.md, Phase 0.5) — return it
    // alongside the score so callers don't hardcode it in two places.
    throw new Error("CodesWholesaleProvider is not implemented yet.");
  }

  /**
   * TODO(Phase 3): GET /v3/orders/{orderId}/invoice, authenticated via
   * getAccessToken(). Call automatically right after a successful
   * orderKey() and store the result — this is purchase-side bookkeeping
   * (what I pay CodesWholesale), separate from and not a substitute for
   * the Belgian-compliant customer invoice built in Phase 3.6.
   *
   * Not part of FulfillmentProvider: the mock has no real invoice to
   * return, and nothing about the sale itself depends on this succeeding.
   */
  async fetchSupplierInvoice(_supplierOrderId: string): Promise<unknown> {
    throw new Error(
      "CodesWholesaleProvider.fetchSupplierInvoice is not implemented yet."
    );
  }

  /**
   * TODO(Phase 3): GET /v3/codes/{codeId}, authenticated via
   * getAccessToken(). This is what resolves an order sitting in
   * `awaiting_code`: the codeId comes from the CODE_PREORDER response
   * orderKey() got at order time, and calling this later is what turns
   * that into an actual delivered key. Return shape should map onto
   * KeyResult the same way orderKey() does.
   *
   * Not part of FulfillmentProvider today — nothing in the app yet polls
   * or resolves awaiting_code orders (no scheduled job exists for it).
   * Add it to the shared interface when that resolution path gets built,
   * so the mock can simulate it too.
   */
  async retrieveCode(_codeId: string): Promise<KeyResult> {
    throw new Error("CodesWholesaleProvider.retrieveCode is not implemented yet.");
  }
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
// The rule this stub is built around: derive expiresAt from whatever
// expires_in actually comes back, store it, and only request a new token
// once that derived time has genuinely passed.
//
// This module-level cache is enough for local dev, but PLAN.md is
// explicit: "Store the token in the database, not in session." A
// module-level variable does not survive across separate serverless
// function instances on Vercel — Phase 3's real implementation needs to
// persist { accessToken, expiresAt } somewhere shared (a DB table), not
// rely on this in-memory shape surviving between requests in production.

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

async function fetchNewToken(): Promise<string> {
  // TODO(Phase 3): POST {CODESWHOLESALE_API_BASE}/oauth/token with
  // grant_type=client_credentials and the client id/secret from env
  // (CODESWHOLESALE_CLIENT_ID / CODESWHOLESALE_CLIENT_SECRET — see
  // .env.example; never hardcode these, never edit .env.local directly).
  // Read `expires_in` from the JSON response — do NOT hardcode 60
  // minutes or any other duration — and set:
  //   cachedToken = { accessToken, expiresAt: Date.now() + response.expires_in * 1000 }
  // Also persist the same to the database (see the comment above this
  // section — the in-memory cache alone isn't enough in production).
  throw new Error("CodesWholesaleProvider token fetch is not implemented yet.");
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
// this has to be a scheduled poll, not a webhook handler. Call
// GET /v3/products with `createdSince` / `updatedSince` set to the last
// sync time, so each run only fetches what actually changed — that's
// both CodesWholesale's own recommended pattern and what keeps this well
// under the 400/10min limit on that endpoint.

/**
 * TODO(Phase 3): implement as a scheduled job (cron, not a webhook
 * handler — there is no postback to receive). GET /v3/products with
 * createdSince/updatedSince set to the last successful sync time,
 * authenticated via getAccessToken(), then upsert the results into
 * Product by supplierProductId (never by title — same rule as
 * everywhere else). Product-page revalidation depends on this sync
 * cadence running regularly, not on any push arriving.
 */
export async function syncCatalog(_since: {
  createdSince?: Date;
  updatedSince?: Date;
}): Promise<void> {
  throw new Error("CodesWholesaleProvider.syncCatalog is not implemented yet.");
}

/**
 * TODO(Phase 3): GET /v3/platforms, /v3/regions, /v3/territory,
 * /v3/languages, authenticated via getAccessToken(). The shop's platform
 * and region filters (currently just derived from whatever's in the
 * Product table — see src/app/shop/page.tsx) must be built from this
 * reference data once it exists, cached locally, never hardcoded.
 * Hardcoding a region list is how the shop ends up claiming to sell a
 * region it can't actually supply. Run alongside syncCatalog on the same
 * schedule; low request volume, no rate limit published for these yet.
 */
export async function syncReferenceData(): Promise<void> {
  throw new Error(
    "CodesWholesaleProvider.syncReferenceData is not implemented yet."
  );
}

/**
 * TODO(Phase 3): GET /v3/products/{productId}/description and
 * GET /v3/productImages/{id}, authenticated via getAccessToken(). Product
 * copy and images for product pages — not needed for Phase 1's mock
 * catalogue, but the real catalogue sync will need somewhere to put
 * this. The Product model doesn't have fields for it yet; that's a
 * schema change to make when this is actually implemented, not now.
 */
export async function fetchProductContent(_productId: string): Promise<unknown> {
  throw new Error(
    "CodesWholesaleProvider.fetchProductContent is not implemented yet."
  );
}
