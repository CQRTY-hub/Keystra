import contactEn from "@/i18n/legal/contact.en";
import { LEGAL_REVIEW_NOTICE_NL } from "@/i18n/legal/legal-review-notice.nl";

/**
 * Dutch sibling of terms.en.ts — same shape (a flat `paragraphs` list,
 * same as every other legal page in src/app), same "not reviewed by a
 * lawyer yet" caveat (see legal-review-notice.nl.ts). Exists per
 * PLAN.md's Wetboek Economisch Recht reading: essential consumer
 * information must be comprehensible to a Flemish buyer in Dutch, even
 * though the shop's default language is English. Reachable via the
 * language toggle on /terms — the English version stays the default and
 * the only one whose version number is recorded per order
 * (TERMS_VERSION, src/lib/consent-text.ts); this is not a separate
 * legally-operative text with its own version track, just the same
 * content made comprehensible.
 *
 * Content follows PLAN.md's Appendix checklist for what the terms
 * specifically need to cover for this business, in the same order the
 * appendix lists them. Trader-identity fields are pulled from
 * contact.en.ts rather than retyped here, so there is exactly one place
 * that holds the real company number/VAT number/address.
 *
 * 2026-08-30: rewritten to close the gaps found in
 * informatieverplichtingen-toetsing.md (checked against FOD Economie's
 * "Informatieverplichtingen in het kader van e-commerce" guidelines) —
 * legal form, digital-content characteristics, payment method, language
 * of this contract, order archiving, the statutory conformity guarantee,
 * ADR/complaints, and VAT treatment are all new paragraphs below. Twee
 * daarvan (reactietermijn, ADR) dragen nog een zichtbare
 * `[TE BEVESTIGEN DOOR JURIST: ...]`-markering — zie
 * Design/juridische-vragen.md voor de volledige lijst open vragen, met
 * de richtlijntekst en de huidige praktijk naast elkaar. (Btw was een
 * derde zo'n markering; opgelost op 2026-09-01 — de boekhouder heeft de
 * vrijstelling bevestigd, zie vat-thresholds.ts voor de drempels die dat
 * zo houden.)
 */
const termsNl = {
  title: "Algemene voorwaarden",
  paragraphs: [
    LEGAL_REVIEW_NOTICE_NL,

    `Wie we zijn, en aan wie we verkopen. Keystra is de handelsnaam waaronder ${contactEn.traderName} (${contactEn.legalForm}, ondernemingsnummer ${contactEn.companyNumber}, btw-nummer ${contactEn.vatNumber}) deze webshop uitbaat, gevestigd op ${contactEn.address}. Vragen kan je stellen via ${contactEn.email}; we streven ernaar binnen ${contactEn.responseTimeBusinessDays} werkdagen te reageren. [TE BEVESTIGEN DOOR JURIST: is een gestelde reactietermijn een toereikend alternatief voor een telefoonnummer? Deze shop heeft geen telefonische klantendienst — één persoon, geen callcenter — vandaar deze keuze in plaats van een (niet-bemand) telefoonnummer.] Deze shop verkoopt uitsluitend aan particuliere consumenten, niet aan bedrijven. Bestel je namens een bedrijf of voor bedrijfsgebruik, neem dan eerst contact met ons op — deze voorwaarden zijn daar niet op geschreven.`,

    "Wat je koopt. Je koopt bij ons een licentiesleutel — een code — voor software of tegoed van een derde partij: bijvoorbeeld een spel, een cadeaubon-tegoed of een top-up-tegoed voor een game. Je koopt niet het spel of de dienst zelf, en Keystra is niet de uitgever ervan. Eenmaal ingewisseld, valt het gebruik ervan onder de eigen voorwaarden van de platformhouder (bijvoorbeeld Steam of de uitgever van de gift card) — niet onder deze voorwaarden.",

    "Kenmerken van wat je koopt. Een sleutel is een platte alfanumerieke code, zonder extra software, drivers of kopieerbeveiliging die Keystra zelf toevoegt. Werking, activatie en eventuele compatibiliteitseisen hangen volledig af van het platform waarop je de sleutel inwisselt (bijvoorbeeld Steam, of het eigen systeem van de cadeaubon-uitgever) — de precieze stappen per productcategorie staan in onze inwisselgidsen.",

    "Regiobeperkingen. Veel sleutels werken alleen in een bepaalde regio of op een bepaald platform. Die beperking staat altijd vermeld op de productpagina, vóór je bestelt. Controleer dit zelf voor je afrekent: een sleutel die niet werkt omdat hij niet bedoeld is voor jouw regio of account, is geen defecte sleutel in de zin van ons terugbetalingsbeleid.",

    "Levering en timing. Sleutels worden elektronisch geleverd, meestal binnen enkele minuten na een bevestigde betaling. Is een sleutel bij uitzondering tijdelijk niet beschikbaar, dan laten we dat weten en volgt levering zodra die er wel is — je bestelling blijft in dat geval gewoon open staan.",

    "Betaalmethode. Tijdens deze testfase van de shop verloopt betaling nog via een tijdelijke, niet-echte betaalpagina — er wordt geen geld afgeschreven. Zodra de echte betaalprovider actief is, tonen we vóór het afrekenen duidelijk welke betaalmethodes worden aanvaard.",

    "Taal van deze voorwaarden. Deze voorwaarden zijn beschikbaar in het Engels en het Nederlands. Bij verschillen tussen beide versies is de Engelse tekst bindend — zie ook 'Wijzigingen en versiebeheer' hieronder.",

    "Toegang tot je bestelling achteraf. Na het afronden van je bestelling kan je die op elk moment terugvinden via 'Bestelling opzoeken', met je e-mailadres en ordernummer — geen account nodig. De bevestiging die je per e-mail ontvangt, bevat dezelfde gegevens en is bedoeld om te bewaren.",

    "Het herroepingsrecht en de uitzondering voor digitale inhoud. Als consument heb je bij een aankoop op afstand normaal gezien 14 dagen de tijd om zonder opgave van reden van je bestelling af te zien. Op digitale inhoud die niet op een fysieke drager staat, geldt hierop een wettelijke uitzondering zodra de levering gestart is — maar uitsluitend als je daar vooraf uitdrukkelijk mee instemde én erkende dat je daardoor je herroepingsrecht verliest. Daarom vragen we dat apart en uitdrukkelijk: bij het afrekenen vink je, los van de gewone voorwaarden-checkbox, een tweede vakje aan met precies die twee dingen erin (zie de afstandsverklaring). Zonder dat aparte akkoord leveren we niet. Zodra je het vakje aanvinkt en de sleutel aan je getoond of gemaild is, kan die aankoop niet meer herroepen worden. Meer uitleg staat in ons terugbetalingsbeleid.",

    "Procedure bij een defecte sleutel. Werkt een sleutel niet, meld dit dan via het contactformulier en voeg screenshots toe die het probleem tonen. Dat bewijs moet van jou komen — zonder te zien wat er misgaat, kunnen wij een fout niet vaststellen. We sturen nooit automatisch een nieuwe sleutel en betalen ook niet automatisch terug: we onderzoeken eerst bij onze leverancier. Hoe lang dat duurt, hangt af van hoe snel de leverancier reageert, dus we kunnen daar geen vaste termijn op plakken — wel houden we je op de hoogte van waar het onderzoek staat.",

    "Wettelijke conformiteitsgarantie. Als consument geniet je de wettelijke garantie van 2 jaar voor consumptiegoederen (art. 1649bis e.v. van het oud Burgerlijk Wetboek), ook voor digitale inhoud en digitale diensten. Deze garantie staat los van, en doet geen afbreuk aan, de procedure hierboven voor een defecte sleutel.",

    `Klachten en geschillenbeslechting. Kom je er met ons niet uit via het contactformulier, dan kan je je klacht voorleggen aan de Consumentenombudsdienst (North Gate II, Koning Albert II-laan 8 bus 1, 1000 Brussel — consumentenombudsdienst.be). [TE BEVESTIGEN DOOR JURIST: dit vermeldt bewust niet langer het Europese ODR-platform, dat op 20 juli 2025 buiten dienst is gesteld — een link ernaar zou nu misleidend zijn. Graag bevestigen dat de Consumentenombudsdienst hier het juiste, actuele aanspreekpunt is, en of Keystra zich hiertoe wettelijk of vrijwillig verbindt.]`,

    "Eén sleutel per bestelling, niet overdraagbaar. Per bestelling lever je één sleutel af. Sleutels zijn voor eigen gebruik bedoeld; doorverkoop is niet toegestaan.",

    "Prijzen en btw. Alle vermelde prijzen zijn de prijzen die je effectief betaalt — er komt niets bij aan het einde van de bestelling, en er wordt geen btw aangerekend. Keystra past de vrijstellingsregeling kleine ondernemingen toe (art. 56bis Btw-Wetboek), bevestigd door onze boekhouder, zolang onze omzet onder de toepasselijke Belgische en Europese drempels blijft. Mocht dat ooit veranderen, dan zie je dat terug op deze pagina en in de prijs vóór je bestelt — nooit iets dat achteraf wordt toegevoegd.",

    "Belgisch recht en bevoegde rechtbank. Op deze overeenkomst is Belgisch recht van toepassing. Dat neemt niet weg dat je als consument de bescherming behoudt van de dwingende bepalingen van het recht van je eigen woonland, en dat je in de gevallen die de wet toelaat ook daar een procedure kan starten. Geschillen die we niet in onderling overleg oplossen, leggen we voor aan de bevoegde Belgische rechtbank, zonder afbreuk te doen aan dat recht.",

    "Wijzigingen en versiebeheer. Deze voorwaarden kunnen na verloop van tijd wijzigen. Voor een bestelling geldt altijd de versie die van kracht was op het moment dat je bestelde, niet een latere versie. Het versienummer van de bindende, Engelstalige tekst staat bovenaan deze pagina.",
  ],
} as const;

export default termsNl;
