import { LEGAL_REVIEW_NOTICE_NL } from "@/i18n/legal/legal-review-notice.nl";

/**
 * Dutch sibling of withdrawal-waiver.en.ts — reference/comprehension
 * text only. The checkbox at checkout stores and shows the English
 * version (WITHDRAWAL_WAIVER_TEXT / WITHDRAWAL_WAIVER_VERSION,
 * src/lib/consent-text.ts) since the shop launches English-first; this
 * is what a Flemish buyer can read via the "Read in Dutch" link next to
 * that checkbox, to satisfy the Wetboek Economisch Recht comprehension
 * requirement without maintaining two parallel, separately-versioned
 * legal texts for the same consent action.
 *
 * `reviewNotice` is kept as its own field, separate from `text`, on
 * purpose — `text` is a precise, word-for-word translation that a buyer
 * (or a lawyer) needs to be able to compare directly against the English
 * original; folding an unrelated disclaimer sentence into that same
 * string would blur exactly the comparison this page exists to support.
 * See legal-review-notice.nl.ts for why the notice exists at all.
 */
const withdrawalWaiverNl = {
  title: "Verklaring afstand herroepingsrecht",
  reviewNotice: LEGAL_REVIEW_NOTICE_NL,
  text: "Ik ga ermee akkoord dat de levering van dit digitale product onmiddellijk mag starten, en ik erken dat ik daardoor mijn wettelijk herroepingsrecht van 14 dagen verlies zodra de key aan mij is getoond of gemaild.",
} as const;

export default withdrawalWaiverNl;
