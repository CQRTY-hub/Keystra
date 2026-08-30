import { LEGAL_REVIEW_NOTICE_NL } from "@/i18n/legal/legal-review-notice.nl";

/**
 * Dutch sibling of refund-policy.en.ts — see terms.nl.ts for why this
 * exists and why it carries no version number of its own. The second
 * paragraph below is an existing, already-real translation of
 * refund-policy.en.ts's own second paragraph (not new placeholder text)
 * — kept as is; only the opening paragraph has been expanded from a bare
 * "not reviewed yet" placeholder into the actual explanation PLAN.md's
 * Appendix asks for: the 14-day rule, the digital-content exception, and
 * why that exception applies here.
 *
 * 2026-08-30: added the statutory conformity guarantee paragraph
 * (informatieverplichtingen-toetsing.md, finding 1.1 — this was missing
 * from the entire site) and reformatted the existing model-form caveat
 * into the same `[TE BEVESTIGEN DOOR JURIST: ...]` marker used elsewhere,
 * for consistency — it was already flagged as needing legal sign-off,
 * just in its own wording. See Design/juridische-vragen.md.
 */
const refundPolicyNl = {
  title: "Terugbetalingsbeleid",
  paragraphs: [
    LEGAL_REVIEW_NOTICE_NL,

    "De 14-dagenregel en de uitzondering voor digitale inhoud. Als consument heb je bij de meeste aankopen op afstand het recht om binnen 14 dagen, zonder opgave van reden, van je aankoop af te zien. Op digitale inhoud die onmiddellijk geleverd wordt — zoals een sleutel die meteen na betaling zichtbaar is — geldt op dat recht een wettelijke uitzondering. Die uitzondering is bij ons van toepassing omdat je bij het afrekenen uitdrukkelijk aangeeft dat de levering meteen mag starten, en uitdrukkelijk erkent dat je daardoor je herroepingsrecht verliest zodra de sleutel aan je getoond of gemaild is. Dat gebeurt via een apart vakje bij het afrekenen, los van de gewone voorwaarden-checkbox — zie de afstandsverklaring voor de precieze tekst. Vink je dat vakje niet aan, dan kunnen we je bestelling niet afronden: zonder die uitdrukkelijke toestemming mogen we niet meteen leveren.",

    "Een defecte key meld je via het contactformulier, met screenshots. We sturen nooit automatisch een vervangende key, en betalen niet terug voordat de leverancier heeft gereageerd — zie de procedure in de algemene voorwaarden.",

    "Wettelijke conformiteitsgarantie. Los van het herroepingsrecht hierboven, en los van de procedure bij een defecte key, geniet je als consument de wettelijke garantie van 2 jaar voor consumptiegoederen (art. 1649bis e.v. van het oud Burgerlijk Wetboek) — ook voor digitale inhoud en digitale diensten. Deze garantie vervalt niet doordat je het herroepingsrecht hebt verloren door onmiddellijke levering.",

    "Modelformulier voor herroeping. Omdat je bij het afrekenen al uitdrukkelijk instemt met onmiddellijke levering, is er in de praktijk geen periode meer waarin je via een herroepingsformulier zou kunnen herroepen. [TE BEVESTIGEN DOOR JURIST: klopt deze redenering, en volstaat het om hier geen apart modelformulier op te nemen? We nemen dit standpunt nu aan omdat het herroepingsrecht op het moment van aanvinken al is prijsgegeven, maar willen dat bevestigd zien voordat de shop live gaat.]",
  ],
} as const;

export default refundPolicyNl;
