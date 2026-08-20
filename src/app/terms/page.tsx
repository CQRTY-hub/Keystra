import type { Metadata } from "next";
import { TERMS_VERSION } from "@/lib/consent-text";

export const metadata: Metadata = { title: "Algemene voorwaarden" };
export const revalidate = 3600;

export default function TermsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Algemene voorwaarden</h1>
      <p className="text-sm text-slate-500">Versie: {TERMS_VERSION}</p>

      <p className="mt-4 text-slate-700">
        PLACEHOLDER — deze tekst is nog niet door een jurist nagekeken en
        mag niet live gaan zonder die controle (zie PLAN.md, Appendix). Ze
        dient hier alleen om de paginastructuur te tonen.
      </p>

      <p className="mt-4 text-slate-700">
        Deze shop verkoopt uitsluitend aan particuliere consumenten, niet
        aan bedrijven. Wat je koopt is een licentiesleutel voor software
        van een derde partij, niet het spel zelf — inwisselen is onderhevig
        aan de eigen voorwaarden van de platformhouder.
      </p>

      <p className="mt-4 text-slate-700">
        Regiobeperkingen en platformrestricties gelden per product en
        staan ook vermeld op de productpagina, vóór aankoop.
      </p>

      <p className="mt-4 text-slate-700">
        Bij het afrekenen bevestig je uitdrukkelijk dat de levering
        onmiddellijk mag starten en dat je daardoor je herroepingsrecht
        van 14 dagen verliest zodra de key aan je is getoond.
      </p>
    </article>
  );
}
