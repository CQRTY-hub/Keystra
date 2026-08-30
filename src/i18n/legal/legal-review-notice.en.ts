/**
 * English sibling of legal-review-notice.nl.ts — same reasoning, same
 * "not reviewed by a lawyer yet" caveat, defined once so it can't drift
 * between terms.en.ts, refund-policy.en.ts, and wherever else it needs
 * to appear. Previously each of those files carried its own separately-
 * worded "PLACEHOLDER" first line; consolidated here 2026-08-30 while
 * rewriting terms.en.ts for parity with terms.nl.ts, for the same reason
 * the Dutch one already lived in a single shared file.
 */
export const LEGAL_REVIEW_NOTICE_EN =
  "Note: this text has not yet been reviewed by a Belgian lawyer and must not go live unchanged (see PLAN.md, Appendix). It exists here to show real content and page structure ahead of that review.";

export default LEGAL_REVIEW_NOTICE_EN;
