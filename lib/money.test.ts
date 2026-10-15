import { describe, expect, it } from "vitest";
import { formatMoney, normalizeCurrencyCode, parseAmount } from "@/lib/money";

// Intl separates the code and number with a non-breaking space.
const plain = (value: string) => value.replace(/ /g, " ");

describe("normalizeCurrencyCode", () => {
  it("accepts ISO 4217 codes regardless of case or padding", () => {
    expect(normalizeCurrencyCode(" ghs ")).toBe("GHS");
    expect(normalizeCurrencyCode("NGN")).toBe("NGN");
  });

  it("rejects missing or malformed codes instead of assuming a currency", () => {
    expect(normalizeCurrencyCode(undefined)).toBeNull();
    expect(normalizeCurrencyCode("")).toBeNull();
    expect(normalizeCurrencyCode("₵")).toBeNull();
    expect(normalizeCurrencyCode("CEDIS")).toBeNull();
    expect(normalizeCurrencyCode(233)).toBeNull();
  });
});

describe("parseAmount", () => {
  it("parses numbers and numeric strings", () => {
    expect(parseAmount(12.5)).toBe(12.5);
    expect(parseAmount("1250.75")).toBe(1250.75);
    expect(parseAmount(0)).toBe(0);
  });

  it("treats null, empty, and non-numeric values as missing", () => {
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount(Number.NaN)).toBeNull();
    expect(parseAmount(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("formatMoney", () => {
  it("always shows the backend-provided currency code", () => {
    expect(plain(formatMoney(1250, "GHS"))).toBe("GHS 1,250.00");
    expect(plain(formatMoney(1250, "USD"))).toBe("USD 1,250.00");
  });

  it("uses each currency's own minor unit", () => {
    expect(plain(formatMoney(1500, "JPY"))).toBe("JPY 1,500");
    expect(plain(formatMoney(1.5, "KWD"))).toBe("KWD 1.500");
  });

  it("formats zero explicitly", () => {
    expect(plain(formatMoney(0, "GHS"))).toBe("GHS 0.00");
  });

  it("formats negative values such as reversals", () => {
    expect(plain(formatMoney(-42.5, "GHS"))).toBe("-GHS 42.50");
  });

  it("does not round away precision beyond the minor unit", () => {
    expect(plain(formatMoney(10.005, "GHS"))).toBe("GHS 10.005");
    expect(plain(formatMoney("99.1234", "GHS"))).toBe("GHS 99.1234");
  });

  it("states when the currency is missing rather than assuming one", () => {
    expect(formatMoney(1250, undefined)).toBe("1,250.00 (currency not provided)");
    expect(formatMoney(1250, "??")).toBe("1,250.00 (currency not provided)");
  });

  it("renders missing amounts as not available", () => {
    expect(formatMoney(null, "GHS")).toBe("Not available");
    expect(formatMoney(undefined, undefined)).toBe("Not available");
    expect(formatMoney("n/a", "GHS")).toBe("Not available");
  });
});
