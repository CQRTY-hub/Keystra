import { describe, expect, it } from "vitest";
import { toCsv, type QuarterlyVatExport } from "@/lib/vat-export";

describe("toCsv", () => {
  it("produces a header row, one row per country, and a total row", () => {
    const data: QuarterlyVatExport = {
      year: 2026,
      quarter: 3,
      totalCents: 6499,
      rows: [
        { countryCode: "NL", countryName: "Netherlands", orderCount: 2, revenueCents: 3999 },
        { countryCode: "FR", countryName: "France", orderCount: 1, revenueCents: 2500 },
      ],
    };

    const lines = toCsv(data).split("\r\n");
    expect(lines[0]).toBe("Country code,Country,Orders,Revenue (EUR)");
    expect(lines[1]).toBe("NL,Netherlands,2,39.99");
    expect(lines[2]).toBe("FR,France,1,25.00");
    expect(lines[3]).toBe(",Total,,64.99");
  });

  it("converts cents to euros with two decimals, never as raw cents", () => {
    const data: QuarterlyVatExport = {
      year: 2026,
      quarter: 1,
      totalCents: 100,
      rows: [{ countryCode: "BE", countryName: "Belgium", orderCount: 1, revenueCents: 100 }],
    };
    expect(toCsv(data)).toContain("BE,Belgium,1,1.00");
  });

  it("quotes a country name that contains a comma", () => {
    const data: QuarterlyVatExport = {
      year: 2026,
      quarter: 1,
      totalCents: 500,
      rows: [
        { countryCode: "XX", countryName: 'Some, Place "Special"', orderCount: 1, revenueCents: 500 },
      ],
    };
    expect(toCsv(data)).toContain('"Some, Place ""Special"""');
  });

  it("handles an empty quarter with just header and a zero total", () => {
    const data: QuarterlyVatExport = { year: 2026, quarter: 2, totalCents: 0, rows: [] };
    const lines = toCsv(data).split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe(",Total,,0.00");
  });
});
