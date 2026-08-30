import { LEGAL_REVIEW_NOTICE_NL } from "@/i18n/legal/legal-review-notice.nl";

/**
 * Dutch sibling of top-up.en.ts — see terms.nl.ts for why this exists,
 * and steam.nl.ts for why the review notice is prepended here.
 */
const topUpGuideNl = {
  title: "Een top-up code toepassen",
  intro: `${LEGAL_REVIEW_NOTICE_NL} Top-up codes voegen in-game valuta of punten rechtstreeks aan je account toe — er is geen aparte walletstap nodig.`,
  steps: [
    "Start het spel en log in op het account dat je wil opwaarderen.",
    'Zoek in het spel het scherm "code inwisselen" of "top-up" — meestal in de winkel of de instellingen.',
    "Voer de code precies in zoals die op je orderbevestiging of in je bevestigingsmail staat.",
    "Het tegoed verschijnt meteen in je account en is direct te besteden in het spel.",
  ],
  notes: [
    "Top-up codes zijn gebonden aan de accountregio die op de productpagina staat.",
    "Eenmaal getoond kan een top-up code niet worden geretourneerd — zie het terugbetalingsbeleid voor wat dit betekent voor het herroepingsrecht van 14 dagen.",
  ],
} as const;

export default topUpGuideNl;
