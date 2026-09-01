/**
 * ISO 3166-1 alpha-2 codes, English display names, and EU membership.
 * Single source of truth for: the checkout country selector
 * (CheckoutForm.tsx), the invoice PDF's "Billed to" address
 * (generate-invoice-pdf.ts), and the VAT threshold split — Belgium vs.
 * rest-of-EU vs. non-EU (vat-thresholds.ts).
 *
 * Why a controlled list instead of the free-text field this used to be:
 * the country is no longer just a display detail once it feeds a
 * compliance threshold (storefront owner, 2026-09-01) — "Belgium",
 * "belgium", and "BE" all meaning the same thing to a human but not to a
 * SQL GROUP BY is exactly the kind of gap worth closing before it
 * matters, not after.
 *
 * EU membership as of 2026: 27 states (post-Brexit, no accessions since).
 */

export interface Country {
  code: string;
  name: string;
  euMember: boolean;
}

const EU_MEMBER_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/**
 * Not an exhaustive ISO list (that's ~250 entries) — EU member states in
 * full, plus the non-EU countries a game-key/gift-card shop's customers
 * realistically come from. Add to this list rather than working around
 * it; every consumer of country data here assumes it's the only source.
 */
export const COUNTRIES: Country[] = [
  { code: "BE", name: "Belgium", euMember: true },
  { code: "NL", name: "Netherlands", euMember: true },
  { code: "FR", name: "France", euMember: true },
  { code: "DE", name: "Germany", euMember: true },
  { code: "LU", name: "Luxembourg", euMember: true },
  { code: "AT", name: "Austria", euMember: true },
  { code: "BG", name: "Bulgaria", euMember: true },
  { code: "HR", name: "Croatia", euMember: true },
  { code: "CY", name: "Cyprus", euMember: true },
  { code: "CZ", name: "Czechia", euMember: true },
  { code: "DK", name: "Denmark", euMember: true },
  { code: "EE", name: "Estonia", euMember: true },
  { code: "FI", name: "Finland", euMember: true },
  { code: "GR", name: "Greece", euMember: true },
  { code: "HU", name: "Hungary", euMember: true },
  { code: "IE", name: "Ireland", euMember: true },
  { code: "IT", name: "Italy", euMember: true },
  { code: "LV", name: "Latvia", euMember: true },
  { code: "LT", name: "Lithuania", euMember: true },
  { code: "MT", name: "Malta", euMember: true },
  { code: "PL", name: "Poland", euMember: true },
  { code: "PT", name: "Portugal", euMember: true },
  { code: "RO", name: "Romania", euMember: true },
  { code: "SK", name: "Slovakia", euMember: true },
  { code: "SI", name: "Slovenia", euMember: true },
  { code: "ES", name: "Spain", euMember: true },
  { code: "SE", name: "Sweden", euMember: true },
  // Non-EU — common outside the bloc for this kind of shop.
  { code: "GB", name: "United Kingdom", euMember: false },
  { code: "CH", name: "Switzerland", euMember: false },
  { code: "NO", name: "Norway", euMember: false },
  { code: "IS", name: "Iceland", euMember: false },
  { code: "US", name: "United States", euMember: false },
  { code: "CA", name: "Canada", euMember: false },
  { code: "AU", name: "Australia", euMember: false },
  { code: "NZ", name: "New Zealand", euMember: false },
  { code: "AE", name: "United Arab Emirates", euMember: false },
  { code: "OTHER", name: "Other", euMember: false },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(code: string): Country | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** Display name for a country code; falls back to the raw value for
 *  pre-dropdown orders that stored free text instead of a code (see
 *  this file's header comment). */
export function countryDisplayName(codeOrLegacyText: string): string {
  return findCountry(codeOrLegacyText)?.name ?? codeOrLegacyText;
}

export type CountryBucket = "belgium" | "other_eu" | "non_eu";

/**
 * The three-way split vat-thresholds.ts groups revenue into. A code this
 * list doesn't recognise (only possible for pre-dropdown legacy orders)
 * is treated as non_eu — the conservative choice for a threshold that
 * exists to catch foreign-EU sales: silently under-counting toward it
 * would be the wrong direction to fail in.
 */
export function classifyCountry(codeOrLegacyText: string): CountryBucket {
  const country = findCountry(codeOrLegacyText);
  if (!country) return "non_eu";
  if (country.code === "BE") return "belgium";
  return country.euMember ? "other_eu" : "non_eu";
}
