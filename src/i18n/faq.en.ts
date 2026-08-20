/**
 * PLAN.md, "Pages needed": minimum 5, covering delivery speed, region
 * locks, what to do if a key fails, and why we're legitimate. Kept as
 * its own content module (same reasoning as src/i18n/guides/) rather
 * than inline in messages/en.ts, since it's substantial, standalone
 * content rather than short UI copy.
 */
const faqEn = [
  {
    question: "How fast do I get my key?",
    answer:
      "Immediately after payment is confirmed — the key appears on the order confirmation page and is emailed to you at the same time. If it's ever delayed, the order confirmation page explains exactly what's happening and why.",
  },
  {
    question: "What does a region lock mean?",
    answer:
      "Some keys, gift cards, and top-up codes only activate in a specific region. The region is shown on every product page before you buy — check it matches your account's region, since a mismatched region will be rejected by the platform, not by us.",
  },
  {
    question: "What if my key doesn't work?",
    answer:
      "Contact us with screenshots showing the error. We investigate every report — see the refund policy for the full process. We never ask you to just try again with the same broken key.",
  },
  {
    question: "How do I redeem what I bought?",
    answer:
      "It depends on what you bought — see the redemption guides for Steam keys, gift cards, and top-up codes. Every product page also links to the guide that applies to it.",
  },
  {
    question: "Is this legitimate?",
    answer:
      "See the About page for who actually runs this shop — a named person, not a stock-photo team. Every order gets a proper invoice, and every key is written to our system before it's ever shown to you, so there's a complete record of what was delivered and when.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "No. Checkout only needs an email address, and you can look up any past order with your order number and that same email — no login required.",
  },
] as const;

export default faqEn;
