/**
 * See terms.en.ts for why this lives here rather than in messages/en.ts
 * — this is the withdrawal-right waiver shown at checkout, one of the
 * four things PLAN.md flags as needing legal review and, eventually, a
 * Dutch sibling (withdrawal-waiver.nl.ts, same shape) before launch.
 *
 * The exact wording and its version number are what get stored per
 * order (Order.withdrawalWaiverVersion, src/lib/consent-text.ts) — never
 * edit this string in place. Add a new version instead, so an order
 * placed under old wording stays provably tied to what it actually
 * showed.
 */
const withdrawalWaiverEn = {
  text: "I agree that delivery of this digital item may start immediately, and I acknowledge that I thereby lose my 14-day statutory right of withdrawal once the key has been shown or emailed to me.",
} as const;

export default withdrawalWaiverEn;
