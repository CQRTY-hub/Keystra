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
 * Environments: `sandbox.codeswholesale.com` (build and test entirely
 * here) and `api.codeswholesale.com` (live, not before Phase 3 step 5).
 *
 * ## Endpoints and their rate limits (confirmed by CodesWholesale support)
 * - `POST /oauth/token` — 50 requests / 5 min per IP. Client-credentials
 *   grant. With caching (see getAccessToken below) this is roughly one
 *   call per hour, nowhere near the limit.
 * - `GET /v3/products` — full price list. 400 requests / 10 min. Don't
 *   poll this on a schedule that assumes every 10-minute window is
 *   free — the catalogue sync below already avoids needing to.
 * - `GET /v3/products/{productId}` — single product. 600 requests / 5
 *   min. This is the one checkAvailability() below calls, at checkout
 *   time only — never on a page view.
 * - `POST /v3/security` — risk score. Rate limit not yet confirmed with
 *   support (see PLAN.md, "Still to confirm").
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
 *   scenario for the fixture the future claim path tests against.
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
    // a failure, it's a valid "awaiting_code" outcome.
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
}

// ---------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------
//
// Confirmed by CodesWholesale support (PLAN.md, Phase 0.5): token
// lifetime is 60 minutes, and requesting a new token while the current
// one is still valid returns the SAME token with its remaining life —
// so over-requesting doesn't rotate anything, but it does waste a call
// against the 50/5min limit and add latency for no reason. The rule
// this stub is built around: store the token, reuse it, only request a
// new one once it has actually expired. Never fetch a token per request.
//
// This module-level cache is enough for local dev, but PLAN.md is
// explicit: "Store the token in the database, not in session." A
// module-level variable does not survive across separate serverless
// function instances on Vercel — Phase 3's real implementation needs to
// persist { accessToken, expiresAt } somewhere shared (a DB table), not
// rely on this in-memory shape surviving between requests in production.

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
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
  // TODO(Phase 3): POST https://sandbox.codeswholesale.com/oauth/token
  // with grant_type=client_credentials and the client id/secret from
  // env. On success, set:
  //   cachedToken = { accessToken, expiresAt: Date.now() + expires_in * 1000 }
  // and persist the same to the database (see the comment above this
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
// per-request. CodesWholesale's own recommended pattern (matches the
// plan): don't repeatedly pull the full GET /v3/products list. Instead
// call it with `createdSince` / `updatedSince` set to the last sync
// time, so each run only fetches what actually changed, and pair that
// with the postback webhook (PLAN.md, Phase 0.5) so most updates arrive
// as pushes rather than needing to be polled for at all.

/**
 * TODO(Phase 3): implement as a scheduled job (or postback handler).
 * GET /v3/products?createdSince=...&updatedSince=... , authenticated via
 * getAccessToken(), then upsert the results into Product by
 * supplierProductId (never by title — same rule as everywhere else).
 * Respects the 400/10min limit on this endpoint by only ever asking for
 * the delta since the last successful sync, not the full list.
 */
export async function syncCatalog(_since: {
  createdSince?: Date;
  updatedSince?: Date;
}): Promise<void> {
  throw new Error("CodesWholesaleProvider.syncCatalog is not implemented yet.");
}
