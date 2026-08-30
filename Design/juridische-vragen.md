# Open juridische vragen / Open legal questions

**Bij:** `informatieverplichtingen-toetsing.md` (projectmap) en de teksten in `src/i18n/legal/` die sindsdien zijn aangevuld (2026-08-30).
**Status:** geen van deze punten is door een jurist bevestigd. Overal waar dit document een vraag noemt, staat in de bijbehorende brontekst (`terms.en/nl.ts`, `refund-policy.en/nl.ts`, `contact.en.ts` via de contactpagina) letterlijk dezelfde vraag, zichtbaar gemarkeerd als `[TE BEVESTIGEN DOOR JURIST: ...]` / `[TO BE CONFIRMED BY LAWYER: ...]` — dit bestand verzamelt ze alleen op één plek voor het gesprek.

De bestaande waarschuwing dat geen enkele tekst op deze site al door een Belgische jurist is nagekeken (`LEGAL_REVIEW_NOTICE_NL` / `LEGAL_REVIEW_NOTICE_EN`) blijft onverkort van kracht — ook voor de teksten die deze vier vragen niet raken.

---

## NL — Nederlands

### 1. Telefoonnummer vervangen door e-mail + reactietermijn

- **Wat de guideline zegt:** "Vermeld de naam van uw onderneming, het adres van de plaats waar u uw activiteit uitoefent, de verschillende contactmogelijkheden (**minstens een professioneel e-mailadres en telefoonnummer**) [...]" (FOD Economie-guideline, §1.1.1, p.4-5).
- **Wat wij nu doen:** geen telefoonnummer. In plaats daarvan: een e-mailadres plus een expliciet gestelde reactietermijn ("we streven ernaar binnen 2 werkdagen te reageren"), zichtbaar op de contactpagina en in de voorwaarden.
- **Waarom deze keuze:** Keystra is een eenmanszaak zonder telefonische klantendienst — een niet-bemand telefoonnummer leek minder nuttig voor een consument dan een concrete reactietermijn op het kanaal dat wél bemand is.
- **De vraag:** is een gestelde reactietermijn een aanvaardbaar alternatief voor een telefoonnummer onder de WER, of is een (eventueel niet-bemand) telefoonnummer toch strikt verplicht?
- **Waar in de code:** `src/i18n/legal/contact.en.ts` (`responseTimeBusinessDays`), `src/app/contact/page.tsx`, `src/i18n/legal/terms.en.ts` / `terms.nl.ts` (paragraaf "Wie we zijn").

### 2. Geschillenbeslechting: Consumentenombudsdienst, geen ODR-platform

- **Wat de guideline zegt:** als een onderneming zich verbindt tot ADR of daar wettelijk toe gehouden is, moet ze de bevoegde entiteit en haar contactgegevens vermelden, zowel op de website als in de algemene voorwaarden (§1.1.2, p.5-6).
- **Wat wij nu doen:** vermelden dat een consument zich kan wenden tot de Consumentenombudsdienst (North Gate II, Koning Albert II-laan 8 bus 1, 1000 Brussel). Bewust **geen** verwijzing naar het Europese ODR-platform.
- **Waarom deze keuze:** het ODR-platform is op 20 juli 2025 door de Europese Commissie buiten dienst gesteld; een link ernaar zou nu een dode/misleidende verwijzing zijn.
- **De vraag:** is de Consumentenombudsdienst hier het juiste, actuele aanspreekpunt, en is Keystra hiertoe wettelijk verplicht of wenst de eigenaar zich hier vrijwillig toe te verbinden? (Dat laatste bepaalt of deze paragraaf verplicht of louter service is.)
- **Waar in de code:** `src/i18n/legal/terms.en.ts` / `terms.nl.ts` (paragraaf "Klachten en geschillenbeslechting" / "Complaints and dispute resolution").

### 3. Btw: vrijstellingsregeling kleine ondernemingen

- **Wat de guideline zegt:** vermeld de prijs inclusief alle belastingen, direct naast het product en nogmaals vóór het sluiten van de overeenkomst (§1.2.3 & §1.4.2, p.7 & p.9).
- **Wat wij nu doen:** de tekst stelt dat Keystra onder de vrijstellingsregeling kleine ondernemingen valt (art. 56bis Btw-Wetboek) en daarom geen btw aanrekent — de weergegeven prijs is dus het volledige, uiteindelijke bedrag.
- **Waarom deze keuze:** dit is de eigenaar zijn eigen inschatting van de huidige fiscale situatie, nog niet geverifieerd.
- **De vraag:** klopt deze kwalificatie nog, en is deze formulering de correcte manier om de vrijstelling op de site te vermelden? Ligt momenteel bij de boekhouder.
- **Waar in de code:** `src/i18n/legal/terms.en.ts` / `terms.nl.ts` (paragraaf "Prijzen en btw" / "Prices and VAT").

### 4. Geen apart modelformulier voor herroeping

- **Wat de guideline zegt:** deel de voorwaarden, termijnen en modaliteiten voor het herroepingsrecht mee, **inclusief het modelformulier voor herroeping** in een afdrukbare/downloadbare versie (§1.4.4, p.10).
- **Wat wij nu doen:** geen apart modelformulier opgenomen. De redenering: omdat de klant bij het afrekenen al uitdrukkelijk instemt met onmiddellijke levering én daarmee het herroepingsrecht verliest zodra de key getoond is, zou er in de praktijk geen periode meer overblijven waarin een herroepingsformulier zinvol is.
- **Waarom deze keuze:** deze redenering stond al vóór deze ronde in de tekst (niet nieuw toegevoegd), nu alleen herkenbaar gemarkeerd.
- **De vraag:** klopt deze redenering juridisch, of moet het modelformulier er sowieso staan — bijvoorbeeld voor de (korte) periode vóór het vakje wordt aangevinkt?
- **Waar in de code:** `src/i18n/legal/refund-policy.en.ts` / `refund-policy.nl.ts` (paragraaf "Model withdrawal form" / "Modelformulier voor herroeping").

---

## EN — English

### 1. Phone number replaced by email + a stated response time

- **What the guideline requires:** "State the name of your business, the address where you carry out your activity, the various ways to contact you (**at least a professional email address and phone number**) [...]" (FOD Economie guideline, §1.1.1, p.4-5).
- **What we do now:** no phone number. Instead: an email address plus an explicitly stated response time ("we aim to reply within 2 business days"), shown on the contact page and in the terms.
- **Why this choice:** Keystra is a sole trader with no phone-based customer service — an unstaffed phone number seemed less useful to a consumer than a concrete response time on the channel that actually is staffed.
- **The question:** is a stated response time an acceptable substitute for a phone number under Belgian consumer-information law, or is a (even unstaffed) phone number strictly required regardless?
- **Where in the code:** `src/i18n/legal/contact.en.ts` (`responseTimeBusinessDays`), `src/app/contact/page.tsx`, `src/i18n/legal/terms.en.ts` / `terms.nl.ts` ("Who we are" paragraph).

### 2. Dispute resolution: Consumer Ombudsman Service, no ODR platform

- **What the guideline requires:** if a business commits to ADR, or is legally required to, it must name the competent entity and its contact details, both on the website and in the general terms (§1.1.2, p.5-6).
- **What we do now:** state that a consumer can turn to the Consumer Ombudsman Service (Consumentenombudsdienst, North Gate II, Koning Albert II-laan 8 bus 1, 1000 Brussels). Deliberately **no** reference to the EU ODR platform.
- **Why this choice:** the European Commission decommissioned the ODR platform on 20 July 2025; linking to it now would be a dead or misleading reference.
- **The question:** is the Consumer Ombudsman Service the correct, current point of contact here, and is Keystra legally required to offer this, or does the owner want to commit to it voluntarily? (That distinction determines whether this paragraph is mandatory or just good service.)
- **Where in the code:** `src/i18n/legal/terms.en.ts` / `terms.nl.ts` ("Complaints and dispute resolution" paragraph).

### 3. VAT: small-business exemption scheme

- **What the guideline requires:** state the price including all taxes, directly next to the product, and again before the contract closes (§1.2.3 & §1.4.2, p.7 & p.9).
- **What we do now:** the text states that Keystra falls under the small-business VAT exemption scheme (art. 56bis of the Belgian VAT Code) and therefore doesn't charge VAT — so the displayed price is the full, final amount.
- **Why this choice:** this is the owner's own current understanding of the tax situation, not yet verified.
- **The question:** is this classification still accurate, and is this the correct way to state the exemption on the site? Currently with the accountant.
- **Where in the code:** `src/i18n/legal/terms.en.ts` / `terms.nl.ts` ("Prices and VAT" paragraph).

### 4. No separate model withdrawal form

- **What the guideline requires:** communicate the conditions, time limits, and procedures for the right of withdrawal, **including the model withdrawal form** in a printable/downloadable version (§1.4.4, p.10).
- **What we do now:** no separate model form included. The reasoning: because the customer already expressly agrees to immediate delivery at checkout — and thereby loses the right of withdrawal once the key is shown — there's in practice no remaining window where a withdrawal form would be useful.
- **Why this choice:** this reasoning already existed in the text before this round (not newly added), now just clearly marked.
- **The question:** is this reasoning legally sound, or should the model form be included regardless — for example, for the (brief) period before the box is ticked?
- **Where in the code:** `src/i18n/legal/refund-policy.en.ts` / `refund-policy.nl.ts` ("Model withdrawal form" paragraph).
