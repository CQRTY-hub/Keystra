const steamGuideEn = {
  title: "How to activate a Steam key",
  intro:
    "Steam keys are redeemed directly in the Steam client — you never need to visit a third-party website.",
  steps: [
    "Open the Steam client and sign in to your account.",
    'Click "Games" in the top menu, then "Activate a Product on Steam…".',
    "Follow the prompts and paste in your key exactly as shown on your order confirmation or in your confirmation email.",
    "The game is added to your library immediately and is ready to install.",
  ],
  notes: [
    "Steam keys are region-locked. Check the region on the product page before buying — a key won't activate outside its region.",
    "A key can only be activated once. If it's already been used, that's the faulty-key situation covered in the refund policy, not something to retry.",
  ],
} as const;

export default steamGuideEn;
