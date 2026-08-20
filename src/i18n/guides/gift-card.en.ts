const giftCardGuideEn = {
  title: "How to redeem a gift card",
  intro:
    "Gift cards are redeemed on the platform they're issued for — the exact steps depend on which one you bought, but the pattern is the same everywhere.",
  steps: [
    "Sign in to the account you want to top up.",
    'Find that platform\'s "redeem a code" or "redeem a gift card" page — usually under account or wallet settings.',
    "Enter the code exactly as shown on your order confirmation or in your confirmation email.",
    "The balance is added to your account immediately and is ready to spend.",
  ],
  notes: [
    "Gift cards are region-locked to the account region shown on the product page. A code from the wrong region will be rejected by the platform.",
    "Once revealed, a gift card code can't be returned — see the refund policy for what this means for the 14-day withdrawal right.",
  ],
} as const;

export default giftCardGuideEn;
