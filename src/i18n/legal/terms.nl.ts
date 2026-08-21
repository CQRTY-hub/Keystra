/**
 * Dutch sibling of terms.en.ts — same shape, same "not reviewed by a
 * lawyer yet" caveat. Exists per PLAN.md's Wetboek Economisch Recht
 * reading: essential consumer information must be comprehensible to a
 * Flemish buyer in Dutch, even though the shop's default language is
 * English. Reachable via the language toggle on /terms — the English
 * version stays the default; this is not a separate legally-operative
 * text, just the same content made comprehensible.
 */
const termsNl = {
  paragraphs: [
    "PLACEHOLDER — deze tekst is nog niet door een jurist nagekeken en mag niet live gaan zonder die controle (zie PLAN.md, Appendix). Ze dient hier alleen om de paginastructuur te tonen.",
    "Deze shop verkoopt uitsluitend aan particuliere consumenten, niet aan bedrijven. Wat je koopt is een licentiesleutel voor software van een derde partij, niet het spel zelf — inwisselen is onderhevig aan de eigen voorwaarden van de platformhouder.",
    "Regiobeperkingen gelden per product en staan ook vermeld op de productpagina, vóór aankoop.",
    "Bij het afrekenen bevestig je uitdrukkelijk dat de levering onmiddellijk mag starten en dat je daardoor je herroepingsrecht van 14 dagen verliest zodra de key aan je is getoond.",
  ],
} as const;

export default termsNl;
