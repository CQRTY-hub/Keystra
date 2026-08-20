/**
 * PLAN.md, "Product scope and launch decisions": legal content is kept
 * separate per language from the start, since it's the hardest thing to
 * retrofit. This is the English body only — not reviewed by a lawyer
 * yet (see the first paragraph itself), and not safe to launch on as-is.
 * A Dutch sibling (terms.nl.ts, same shape) is needed before launch per
 * the Wetboek Economisch Recht reading in PLAN.md, at the same time a
 * lawyer reviews the wording.
 */
const termsEn = {
  paragraphs: [
    "PLACEHOLDER — this text has not been reviewed by a lawyer and must not go live without that review (see PLAN.md, Appendix). It exists here only to show the page structure.",
    "This shop sells to private consumers only, not businesses. What you're buying is a licence key for third-party software, not the game itself — redemption is subject to the platform holder's own terms.",
    "Region locks apply per product and are also shown on the product page, before purchase.",
    "At checkout you explicitly confirm that delivery may begin immediately, and that you thereby lose your 14-day withdrawal right once the key has been shown to you.",
  ],
} as const;

export default termsEn;
