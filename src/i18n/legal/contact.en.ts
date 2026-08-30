/**
 * Trader identity, per PLAN.md Appendix ("Trader identity") and Belgian
 * consumer-information law. Real values only — `null` renders as "To
 * follow." (src/app/contact/page.tsx) rather than an invented one.
 *
 * `traderName` / `legalForm`: confirmed 2026-08-30 against the public KBO
 * register (kbopub.economie.fgov.be) for company number 1008236113 —
 * "Type entiteit: Natuurlijk persoon", registered under Hamish Vandersype.
 * That's a sole trader (eenmanszaak), not a separate company — Belgian
 * consumer-information law generally requires the actual trader's name
 * for this legal form, not just the trade name. `entityName` ("CQRTY")
 * stays as the trade name Keystra operates under; the two are shown
 * together (see terms.nl.ts / terms.en.ts and contact/page.tsx).
 *
 * `responseTimeBusinessDays`: see the response-time entry in
 * Design/juridische-vragen.md — this shop has no phone line (one person,
 * no call desk), so email plus a stated response time stands in for the
 * "email and phone number" the guideline names. The number below is the
 * owner's own working assumption, not yet confirmed by a lawyer.
 */
const contactEn = {
  entityName: "CQRTY",
  traderName: "Hamish Vandersype",
  legalForm: "Sole trader (eenmanszaak) under Belgian law",
  email: "sectechoffers@gmail.com",
  responseTimeBusinessDays: 2,
  companyNumber: "1008236113",
  vatNumber: "BE1008236113",
  address: "Kloosterstraat 7, 8560 Wevelgem, Belgium",
} as const;

export default contactEn;
