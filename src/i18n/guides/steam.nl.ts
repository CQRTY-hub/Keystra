import { LEGAL_REVIEW_NOTICE_NL } from "@/i18n/legal/legal-review-notice.nl";

/**
 * Dutch sibling of steam.en.ts — see terms.nl.ts for why this exists.
 * PLAN.md, "Pages": the redemption guides are the "instructions for
 * use" and get confirmed with a lawyer alongside the terms/refund
 * policy — hence the same review notice prepended to the intro.
 */
const steamGuideNl = {
  title: "Een Steam-key activeren",
  intro: `${LEGAL_REVIEW_NOTICE_NL} Steam-keys wissel je rechtstreeks in via de Steam-client — je hoeft nooit een externe website te bezoeken.`,
  steps: [
    "Open de Steam-client en log in op je account.",
    'Klik op "Games" in het bovenste menu, daarna op "Een product op Steam activeren…".',
    "Volg de stappen en plak je key precies zoals die op je orderbevestiging of in je bevestigingsmail staat.",
    "Het spel wordt meteen aan je bibliotheek toegevoegd en is klaar om te installeren.",
  ],
  notes: [
    "Steam-keys zijn regiogebonden. Controleer de regio op de productpagina vóór aankoop — een key activeert niet buiten zijn regio.",
    "Een key kan maar één keer geactiveerd worden. Is hij al gebruikt, dan is dat de situatie van een defecte key uit het terugbetalingsbeleid — niet iets om opnieuw te proberen.",
  ],
} as const;

export default steamGuideNl;
