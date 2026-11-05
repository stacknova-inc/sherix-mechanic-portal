const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const MAX_DISPLAY_FRACTION_DIGITS = 6;

export const MONEY_NOT_AVAILABLE = "Not available";
export const CURRENCY_NOT_PROVIDED = "currency not provided";

/**
 * Accepts an ISO 4217 code from the backend. Returns null when the backend did
 * not send a usable code, so callers never fall back to an assumed currency.
 */
export function normalizeCurrencyCode(currency: unknown): string | null {
  if (typeof currency !== "string") {
    return null;
  }

  const code = currency.trim().toUpperCase();
  return CURRENCY_CODE_PATTERN.test(code) ? code : null;
}

/** Backend amounts may arrive as numbers or numeric strings; anything else is missing. */
export function parseAmount(amount: unknown): number | null {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : null;
  }

  if (typeof amount === "string" && amount.trim() !== "") {
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function countFractionDigits(value: number): number {
  const [, fraction = ""] = String(Math.abs(value)).split(".");
  return fraction.length;
}

/**
 * Formats a backend amount in the backend-provided currency.
 *
 * - The currency code is always shown ("GHS 1,250.00"), never a bare symbol.
 * - Precision beyond the currency's minor unit is kept (up to 6 digits) rather
 *   than rounded away, so displayed values never silently disagree with records.
 * - Missing amounts render as "Not available"; a missing currency is stated
 *   explicitly instead of assuming one.
 */
export function formatMoney(amount: unknown, currency: unknown, locale = "en"): string {
  const value = parseAmount(amount);

  if (value === null) {
    return MONEY_NOT_AVAILABLE;
  }

  const fractionDigits = Math.min(countFractionDigits(value), MAX_DISPLAY_FRACTION_DIGITS);
  const code = normalizeCurrencyCode(currency);

  if (!code) {
    const number = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.max(2, fractionDigits),
    }).format(value);

    return `${number} (${CURRENCY_NOT_PROVIDED})`;
  }

  const currencyDefaults = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
  }).resolvedOptions();
  const minorUnitDigits = currencyDefaults.maximumFractionDigits ?? 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    currencyDisplay: "code",
    minimumFractionDigits: minorUnitDigits,
    maximumFractionDigits: Math.max(minorUnitDigits, fractionDigits),
  }).format(value);
}
