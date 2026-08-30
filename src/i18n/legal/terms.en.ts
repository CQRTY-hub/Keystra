import contactEn from "@/i18n/legal/contact.en";
import { LEGAL_REVIEW_NOTICE_EN } from "@/i18n/legal/legal-review-notice.en";

/**
 * PLAN.md, "Product scope and launch decisions": legal content is kept
 * separate per language from the start, since it's the hardest thing to
 * retrofit. This is the English body — the binding, versioned text (see
 * TERMS_VERSION, src/lib/consent-text.ts). terms.nl.ts is the Dutch
 * sibling, same shape, same content, for comprehension only (see its own
 * comment for why it carries no separate version).
 *
 * 2026-08-30: rewritten from a four-line placeholder to match
 * terms.nl.ts paragraph-for-paragraph (informatieverplichtingen-
 * toetsing.md, finding 2.1 — the two versions had drifted so far apart
 * that this file, despite being the legally-binding one, was the least
 * complete of the two). Also folds in every other actionable finding
 * from that audit: the statutory conformity guarantee, digital-content
 * characteristics, payment method, contract language, order archiving,
 * ADR/complaints, and VAT treatment. Three paragraphs carry a visible
 * `[TO BE CONFIRMED BY LAWYER: ...]` marker for a judgment call made
 * without legal sign-off — see Design/juridische-vragen.md for the full
 * list, with the guideline text and current practice side by side.
 */
const termsEn = {
  paragraphs: [
    LEGAL_REVIEW_NOTICE_EN,

    `Who we are, and who we sell to. Keystra is the trade name under which ${contactEn.traderName} (${contactEn.legalForm}, company number ${contactEn.companyNumber}, VAT number ${contactEn.vatNumber}) operates this webshop, based at ${contactEn.address}. Questions can be sent to ${contactEn.email}; we aim to reply within ${contactEn.responseTimeBusinessDays} business days. [TO BE CONFIRMED BY LAWYER: is a stated response time an acceptable stand-in for a phone number? This shop has no phone-based customer service — one person, no call desk — hence this instead of an unstaffed phone line.] This shop sells to private consumers only, not businesses. If you're ordering on behalf of a business, or for business use, contact us first — these terms aren't written for that.`,

    "What you're buying. You're buying a licence key — a code — for third-party software or credit: for example a game, a gift-card balance, or a top-up credit for a game. You are not buying the game or service itself, and Keystra is not its publisher. Once redeemed, its use is governed by the platform holder's own terms (for example Steam, or the gift card's issuer) — not by these terms.",

    "Characteristics of what you're buying. A key is a plain alphanumeric code, with no additional software, drivers, or copy protection added by Keystra itself. How it works, how it activates, and any compatibility requirements depend entirely on the platform you redeem it on (for example Steam, or the gift card issuer's own system) — the exact steps per product category are in our redemption guides.",

    "Region locks. Many keys only work in a specific region or on a specific platform. That restriction is always shown on the product page, before you order. Check this yourself before checkout: a key that doesn't work because it isn't meant for your region or account is not a faulty key under our refund policy.",

    "Delivery and timing. Keys are delivered electronically, usually within minutes of confirmed payment. If a key is exceptionally, temporarily unavailable, we'll say so and deliver as soon as it is — your order simply stays open in that case.",

    "Payment method. During this testing phase of the shop, payment still goes through a temporary, non-real payment page — no money is actually charged. Once the real payment provider is live, we'll clearly show which payment methods are accepted before you check out.",

    "Language of these terms. These terms are available in English and Dutch. Where the two versions differ, the English text is binding — see 'Changes and version control' below.",

    "Accessing your order afterward. Once your order is complete, you can find it again at any time via 'Track your order', with your email address and order number — no account needed. The confirmation you get by email carries the same details and is meant to be kept.",

    "The right of withdrawal and the digital-content exception. As a consumer, you normally have 14 days from a distance purchase to cancel it without giving a reason. For digital content not supplied on a physical medium, a statutory exception to that right applies once delivery has started — but only if you expressly agreed to that beforehand, and acknowledged that you thereby lose your right of withdrawal. That's why we ask for that separately and explicitly: at checkout, apart from the ordinary terms checkbox, you tick a second box containing exactly those two things (see the withdrawal waiver). We don't deliver without that separate agreement. Once you tick the box and the key has been shown or emailed to you, that purchase can no longer be withdrawn. More detail is in our refund policy.",

    "Procedure for a faulty key. If a key doesn't work, report it through the contact form and include screenshots showing the problem. That evidence has to come from you — without seeing what's going wrong, we can't establish a fault. We never automatically send a replacement key, and we don't automatically refund either: we investigate with our supplier first. How long that takes depends on how fast the supplier responds, so we can't put a fixed deadline on it — we do keep you updated on where the investigation stands.",

    "Statutory conformity guarantee. As a consumer, you're covered by the 2-year statutory guarantee for consumer goods (art. 1649bis et seq. of the old Belgian Civil Code), which also applies to digital content and digital services. This guarantee exists separately from, and doesn't limit, the faulty-key procedure above.",

    `Complaints and dispute resolution. If we can't resolve things through the contact form, you can bring your complaint to the Consumer Ombudsman Service (Consumentenombudsdienst, North Gate II, Koning Albert II-laan 8 bus 1, 1000 Brussels — consumentenombudsdienst.be). [TO BE CONFIRMED BY LAWYER: this deliberately no longer references the EU ODR platform, which was decommissioned on 20 July 2025 — linking to it now would be misleading. Please confirm the Consumer Ombudsman Service is the correct, current point of contact here, and whether Keystra is legally required or willing to commit to this.]`,

    "One key per order, non-transferable. Each order delivers one key. Keys are for personal use; resale is not permitted.",

    "Prices and VAT. All prices shown are the prices you actually pay — nothing is added at the end of checkout. Keystra currently falls under the small-business VAT exemption scheme (art. 56bis of the Belgian VAT Code): we don't charge VAT on our sales. [TO BE CONFIRMED BY LAWYER / ACCOUNTANT: this scheme, and how it's stated here, are still pending confirmation from our accountant. This text assumes the exemption keeps applying and may correctly be stated this way.]",

    "Belgian law and competent court. This agreement is governed by Belgian law. That doesn't take away the protection you retain, as a consumer, under the mandatory provisions of the law of your own country of residence, or your right to bring proceedings there in the cases the law allows. Disputes we can't resolve directly are brought before the competent Belgian court, without prejudice to that right.",

    "Changes and version control. These terms may change over time. Your order is always governed by the version in force at the moment you ordered, not a later one. The version number of this binding text is shown at the top of this page.",
  ],
} as const;

export default termsEn;
