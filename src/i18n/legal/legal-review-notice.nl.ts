/**
 * Shared by every Dutch-language consumer-information text this covers —
 * terms, refund/withdrawal policy, the three redemption guides, and the
 * withdrawal-waiver reference page. PLAN.md's Appendix is explicit that
 * the actual wording of every legal document needs sign-off from a
 * Belgian lawyer before launch ("I'm building the machinery; someone
 * qualified signs off on the words"). Defined once, here, so that
 * warning can't drift or go missing in one of the six places it needs
 * to appear.
 *
 * Comprehension-only, like every Dutch text in src/i18n/legal and
 * src/i18n/guides (see terms.nl.ts's own comment) — this notice carries
 * no version number of its own and is never what's recorded on an order.
 * Remove it only once a Belgian lawyer has actually reviewed the text it
 * sits above — not when the text merely looks finished.
 */
export const LEGAL_REVIEW_NOTICE_NL =
  "Let op: deze Nederlandstalige tekst is er om begrijpelijk te zijn voor Nederlandstalige kopers, maar is nog niet nagekeken door een Belgische jurist. Ze mag niet ongewijzigd gebruikt worden zodra de shop live gaat — die controle moet eerst gebeuren.";

export default LEGAL_REVIEW_NOTICE_NL;
