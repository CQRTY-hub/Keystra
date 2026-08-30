# Toetsing informatieverplichtingen e-commerce

**Referentiedocument:** `guidelines-informatieverplichtingen-in-het-kader-van-e-commerce.pdf` (FOD Economie, 24.11.2025), in dezelfde map.
**Datum van deze toetsing:** 30 augustus 2026
**Status:** Nog niet voorgelegd aan een jurist. Niets is op basis hiervan al aangepast in de code — dit is alleen een inventarisatie ter voorbereiding van dat gesprek.

**Gecontroleerde onderdelen van de site:** algemene voorwaarden (EN + NL), privacybeleid, herroepings-/terugbetalingsbeleid (EN + NL), cookiebeleid, contactpagina (handelsidentiteit), afstandsverklaring in de checkout, productpagina's, cart- en checkoutpagina, orderbevestiging, footer/navigatie.

**Belangrijk vooraf:** de PDF gaat over Belgisch recht (Wetboek Economisch Recht). Dat is hier het juiste kader, want de handelsidentiteit op de site (`contact.en.ts`) toont een Belgisch ondernemingsnummer en adres.

**Opvallende structurele bevinding:** volgens de code-commentaren is de **Engelse tekst van de voorwaarden de juridisch bindende, geversioneerde versie** (`terms.nl.ts`, regel 10-15), niet de Nederlandse. Op dit moment is die Engelse tekst echter een kale placeholder van vier zinnen, terwijl de Nederlandse tekst — die eigenlijk alleen ter *begrip* zou moeten dienen — al veel meer bevat (bedrijfsidentiteit, toepasselijk recht, garantieprocedure, wijzigingsbeleid). Dat betekent dat een aantal punten hieronder er in het Nederlands wél staan, maar in de bindende Engelse tekst ontbreken. Dat is apart aangeduid.

---

## 1. Ontbreekt — nergens op de site

| # | Verplichting | PDF | Waar het zou moeten staan |
|---|---|---|---|
| 1.1 | Wettelijke conformiteitsgarantie (2 jaar), ook voor digitale inhoud | §1.4.5, p.11 | Nergens vermeld — hoort in `terms` en/of `refund-policy` |
| 1.2 | Kenmerken van de digitale inhoud: functionaliteit, technische beveiliging, interoperabiliteit | §1.2.1 (laatste alinea) + §1.4.1 (voetnoot), p.7 | Productpagina toont alleen categorie, regio, prijs |
| 1.3 | Betaalmiddelen zichtbaar vóór het afrekenen | §1.3, p.8 | Nu logisch afwezig (Mollie nog stub) — **wordt relevant zodra Taak 3 live gaat**; moet dan op de productpagina of vroeg in het proces staan, niet pas op Mollie's eigen scherm |
| 1.4 | Talen waarin de overeenkomst/voorwaarden geraadpleegd kunnen worden | §1.4.1, p.8 | EN/NL-toggle bestaat functioneel, wordt nergens benoemd |
| 1.5 | Archivering van de overeenkomst — blijft de bestelling na sluiting toegankelijk? | §1.4.1, p.8 | Order-lookup doet dit impliciet, wordt nergens als zodanig uitgelegd |
| 1.6 | ADR / buitengerechtelijke geschillenbeslechting | §1.1.2, p.5-6 | Nergens vermeld — **voorwaardelijke verplichting**, geldt alleen als Keystra zich hiertoe verbindt of wettelijk verplicht is |

**Vraag voor de jurist bij 1.6:** moet of wil Keystra een ADR-procedure aanbieden (bv. Consumentenombudsdienst + EU ODR-platform)? Zo ja, moet dit zowel op de website als in de voorwaarden komen (PDF-tip op p.6 geeft voorbeeldformulering).

---

## 2. Staat er, maar onvolledig of op de verkeerde plek

| # | Bevinding | PDF | Locatie in code |
|---|---|---|---|
| 2.1 | Bindende Engelse tekst mist bijna alles wat de Nederlandse "vertaling" wel heeft, inclusief **toepasselijk recht en bevoegde rechter** (harde verplichting) | §1.4.1, p.8-9 | `terms.en.ts` (4 placeholder-zinnen) vs. `terms.nl.ts` (compleet) |
| 2.2 | Voornaamste kenmerken + totaalprijs moeten vlak vóór de bestelknop staan, zonder de pagina te verlaten | §1.5, p.11-12 | `CheckoutForm.tsx` toont alleen e-mail, twee checkboxes en totaalbedrag — **geen overzicht van wat er besteld wordt**; dat staat alleen op de aparte `/cart`-pagina |
| 2.3 | Herroepingsrecht-verwijzing hoort al bij de productfiche (tab/link) | §1.2.2, p.7 | Productpagina linkt alleen naar de redemption-guide, niet naar herroepings-/terugbetalingsbeleid |
| 2.4 | Telefoonnummer bij ondernemingsgegevens ("minstens een professioneel e-mailadres **en** telefoonnummer") | §1.1.1, p.4-5 | `contact.en.ts` heeft alleen e-mail |
| 2.5 | Rechtsvorm van de onderneming | §1.4.1, p.8-9 | `about.en.ts` noemt "operating as the legal entity CQRTY" maar niet de rechtsvorm (eenmanszaak, BV, ...) |
| 2.6 | Prijzen inclusief belastingen — nergens vermeld of/dat getoonde prijzen alle belastingen bevatten | §1.2.3 & §1.4.2, p.7 & p.9 | Geen enkele vermelding op product-, cart- of checkoutpagina |
| 2.7 | Modelformulier voor herroeping — bewust (nog) niet opgenomen | §1.4.4, p.10 | `refund-policy.nl.ts` legt dit zelf al uit, met eigen voorbehoud "onze jurist bevestigt dit standpunt" — al gevlagd in de tekst zelf |
| 2.8 | Terugbetaling pas na reactie leverancier | §1.4.4/§1.4.5 (duidelijkheid herroeping/garantie) | `terms.nl.ts` en `refund-policy.nl/en.ts` — dit is precies waar Taak 2 (apart traject) dit al rechttrekt; hier alleen als kruisverwijzing genoteerd |

**Vraag voor de jurist bij 2.4:** is een telefoonnummer strikt verplicht voor een eenpersoonszaak zonder telefonische klantendienst, of volstaat een ander snel kanaal (contactformulier/e-mail)?

**Vraag voor de jurist bij 2.6:** hoe wordt btw hier verwerkt bij internationale verkoop van digitale content (OSS-regeling), en moet dat expliciet naast elke prijs vermeld worden?

---

## 3. In orde — ter bevestiging

- **Ondernemingsgegevens** (naam, ondernemingsnummer, btw-nummer, adres, e-mail) — centraal op `/contact`, bereikbaar via de footer op elke pagina. (§1.1.1)
- **Herroepingsrecht: aparte, uitdrukkelijke checkbox** los van de gewone voorwaarden-checkbox bij checkout. (§1.4.4/§1.5)
- **Knoptekst "bestelling met betalingsverplichting"** — de submit-knop zegt letterlijk *"Order with obligation to pay"*, exact conform de wettelijke minimumformulering. (§1.5, p.12)
- **Regio-informatie op elke productpagina, vóór aankoop.** (§1.2.1/§1.3)
- **Ontvangstbevestiging van de bestelling** direct zichtbaar na bestellen. (§1.6)
- **Klantreviews (§1.1.3)** — niet van toepassing: geen reviewfunctie op de site.
- **Gepersonaliseerde prijzen (§1.4.2)** — niet van toepassing: geen prijspersonalisatie.

---

## Samenvatting voor het gesprek met de jurist

Drie soorten actie tekenen zich af:

1. **Rechttoe-rechtaan aanvullingen** (§1.1 t/m 1.5, 2.2, 2.3, 2.5): tekst toevoegen/verplaatsen, geen inhoudelijke keuze nodig.
2. **Beleidskeuzes die eerst een antwoord nodig hebben** voordat er tekst geschreven kan worden: ADR (1.6), telefoonnummer (2.4), btw-vermelding (2.6).
3. **De EN/NL-mismatch (2.1)** is los van de guideline een risico op zich: de tekst die juridisch bindend zou moeten zijn, is op dit moment de minst complete van de twee.
