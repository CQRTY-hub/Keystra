/**
 * Dutch sibling of withdrawal-waiver.en.ts — reference/comprehension
 * text only. The checkbox at checkout stores and shows the English
 * version (WITHDRAWAL_WAIVER_TEXT / WITHDRAWAL_WAIVER_VERSION,
 * src/lib/consent-text.ts) since the shop launches English-first; this
 * is what a Flemish buyer can read via the "Read in Dutch" link next to
 * that checkbox, to satisfy the Wetboek Economisch Recht comprehension
 * requirement without maintaining two parallel, separately-versioned
 * legal texts for the same consent action.
 */
const withdrawalWaiverNl = {
  text: "Ik ga ermee akkoord dat de levering van dit digitale product onmiddellijk mag starten, en ik erken dat ik daardoor mijn wettelijk herroepingsrecht van 14 dagen verlies zodra de key aan mij is getoond of gemaild.",
} as const;

export default withdrawalWaiverNl;
