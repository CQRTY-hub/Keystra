# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS. PostgreSQL via Supabase, accessed through
Prisma. Deploy target: Vercel. Payments: Mollie (stubbed in Phase 1, not yet connected).
Errors: Sentry (not yet wired). Supplier: CodesWholesale (mocked behind a
`FulfillmentProvider` interface in Phase 1; the real v3 API integration is a Phase 3 stub
only, see `src/lib/fulfillment/codeswholesale-provider.ts`).

## Users

Someone on a phone, often late at night, deciding whether this site is a scam before they
decide whether they want the game. They arrive already knowing what they want — from a
search or a social post (TikTok, Instagram) — so the job is not to persuade them; it's to
get out of their way and give them no reason to close the tab. Many have been burned before
on a similar site, or know someone who has, and every design decision gets read through
that filter.

## Product Purpose

Keystra sells Steam keys, gift cards, and in-game top-up codes to European consumers. Run
by one person, based in Belgium. Not a marketplace: products are bought from a single
distributor (CodesWholesale) and sold directly — every product listed is Keystra's own
inventory, not a third party's.

## Positioning

Accountability a marketplace can't truthfully claim. Competitors in this category (G2A,
Kinguin, AllKeyShop) are marketplaces where independent third-party sellers list their own
keys — which is also where the stolen-card and fraudulent-key problems in this category
come from. Keystra sources everything itself from one paid distributor relationship and
stands behind every key sold, with no other seller to point to when something goes wrong.

## Operating Context

Currently Phase 1 of the build: a working storefront with a full checkout flow against a
mock supplier and a stubbed payment provider — deliberately unstyled, functionally
complete. No real supplier or payment credentials exist yet (Phase 3 gate). EU consumer law
shapes checkout directly: a dedicated withdrawal-right waiver checkbox (separate from terms,
unticked by default) is required before a key is shown, region locks and platform
restrictions must be visible pre-purchase, and a database-backed kill switch can stop new
sales without a deploy. Launch language is English; Dutch is provided for the four things
that carry legal weight (terms, refund/withdrawal policy, redemption guides, the
withdrawal-waiver text) per Belgian consumer-information law, reachable via a language
toggle rather than a site-wide switch.

## Capabilities and Constraints

- **No control over product imagery.** Boxart comes from publishers via the distributor —
  loud, inconsistent aspect ratios and quality, and out of Keystra's hands. Whatever ships
  has to remain legible and trustworthy despite that, not assume clean, uniform assets.
- **Faulty-key claims are always a human decision.** Never automated, never resolved by a
  support widget — this is a standing rule (see `CLAUDE.md`), not a preference.
- **B2C only, deliberately.** No VAT-number field, no reverse-charge invoicing, no gifting
  at launch (a common fraud pattern in this category) — see PLAN.md for the reasoning.
- **Region-locked inventory.** Region and platform must be shown on the product page before
  purchase, not discovered in the terms.
- **One key, one order.** Keys are never duplicated or re-issued from Keystra's own
  database.
- A full anti-reference and visual-direction brief already exists at
  `keystra-brand-brief.md` (competitor specifics to avoid, a light/navy/gold direction with
  rationale, mobile-first constraints) — durable input for the design pass, not repeated
  here since it's visual-world material, not product truth.

## Brand Commitments

- **Name: Keystra.** Confirmed as the storefront's actual name — replaces the
  "Storefront (working title)" placeholder used throughout Phase 1's unstyled build.
- **CQRTY** is the legal/tax entity behind Keystra, not the storefront name — the two are
  deliberately distinct.
- Solo operator, based in Belgium.
- Voice: calm, direct, legitimate. Never sounds excited — no exclamation marks, no urgency
  language, no countdowns. Reads as a shop that expects to still be here in five years and
  doesn't need any one sale.

## Evidence on Hand

- No real name or photo yet for the About/trust page — currently a placeholder
  (`src/app/about/page.tsx`) stating plainly that it needs a real person, not invented.
  Trust posture depends on this being a real, named individual, not a stock-photo team.
- No customer reviews exist yet; none are planned before launch (see PLAN.md — reviews only
  ship once they can be verifiably tied to real orders).
- Product imagery quality is inconsistent and supplier-controlled (see Capabilities and
  Constraints) — no curated asset library to draw on beyond what the distributor provides.
- `keystra-brand-brief.md` in the project root: the full anti-reference and visual-direction
  brief, ready for the design pass.

## Product Principles

1. **Get out of the way.** The visitor already decided what they want before arriving; the
   job is removing friction and reasons to distrust, not persuading.
2. **Accountable, not a marketplace.** Every product is Keystra's own inventory from one
   distributor relationship — that's the actual trust mechanism, not a claim to dress up.
3. **Trust is earned before purchase, not argued after.** Region locks, delivery timing,
   and the refund/faulty-key procedure are disclosed up front, never buried in terms.
4. **Design for imagery it can't control.** Inconsistent, publisher-supplied boxart is a
   permanent constraint, not a temporary asset problem to design around once.
5. **Never automate a human trust decision.** Faulty-key claims and refunds are always a
   person's judgment call, never a widget's.
