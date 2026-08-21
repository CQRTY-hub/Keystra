/** Dutch sibling of gift-card.en.ts — see terms.nl.ts for why this exists. */
const giftCardGuideNl = {
  title: "Een gift card inwisselen",
  intro:
    "Gift cards wissel je in op het platform waarvoor ze uitgegeven zijn — de precieze stappen verschillen per platform, maar het patroon is overal hetzelfde.",
  steps: [
    "Log in op het account dat je wil opwaarderen.",
    'Zoek op dat platform de pagina "code inwisselen" of "gift card inwisselen" — meestal onder account- of walletinstellingen.',
    "Voer de code precies in zoals die op je orderbevestiging of in je bevestigingsmail staat.",
    "Het tegoed wordt meteen aan je account toegevoegd en is direct te besteden.",
  ],
  notes: [
    "Gift cards zijn gebonden aan de accountregio die op de productpagina staat. Een code uit de verkeerde regio wordt door het platform geweigerd.",
    "Eenmaal getoond kan een gift card-code niet worden geretourneerd — zie het terugbetalingsbeleid voor wat dit betekent voor het herroepingsrecht van 14 dagen.",
  ],
} as const;

export default giftCardGuideNl;
