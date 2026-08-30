/**
 * PLAN.md, "Pages needed" originally called for a real name and photo
 * here. Storefront owner's direction, 2026-08-24: not a personal bio at
 * all — write about Keystra itself instead (one distributor instead of a
 * marketplace, how delivery works, how a faulty key gets handled). The
 * accountability question a bio would normally answer is instead answered
 * by the operating model below, plus the real legal-entity details on
 * /contact.
 */
const aboutEn = {
  paragraphs: [
    "Keystra is not a marketplace. Every product listed here is Keystra's own inventory — bought from a single distributor and sold directly, never a listing handed off from an unrelated third-party seller. That's also where most of the stolen-card and fraudulent-key problems in this category come from: a marketplace can point to \"the seller\" when something goes wrong. Keystra can't, because there isn't one — there's just Keystra, and the one distributor relationship behind every key.",
    "Delivery is electronic and immediate. Once a payment is confirmed, your key appears on the confirmation page and is also sent by email as a backup — nothing to wait on, nothing that depends on a person being online. Region is shown on every product page before you buy, never discovered afterward in the terms.",
    "If a key doesn't work, it's handled by a person, with evidence, and resolved through the refund policy — never an automated claim, never a chatbot deciding whether to believe you.",
    "Keystra is run by one person, based in Belgium, operating as the legal entity CQRTY. Registration and contact details are on the Contact page.",
  ],
} as const;

export default aboutEn;
