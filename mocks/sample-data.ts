/**
 * Shared building blocks for UI-only sample data. Values are generated from a
 * fixed seed so screens look the same on every reload, and dates are relative
 * to "now" so the data never looks stale. Everything here is fictional.
 */

export const SAMPLE_CURRENCY = "GHS";

export function createRandom(seed: number) {
  let state = seed >>> 0;

  // mulberry32
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    /** Two-decimal amount between min and max. */
    amount: (min: number, max: number) => Math.round((min + next() * (max - min)) * 100) / 100,
  };
}

export function daysAgo(days: number, hour = 10, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export interface SampleMechanic {
  id: string;
  name: string;
}

export const SAMPLE_MECHANICS: readonly SampleMechanic[] = [
  { id: "mech_sample_01", name: "Kwame Asante" },
  { id: "mech_sample_02", name: "Abena Owusu" },
  { id: "mech_sample_03", name: "Kofi Mensah" },
  { id: "mech_sample_04", name: "Efua Boateng" },
  { id: "mech_sample_05", name: "Yaw Darko" },
  { id: "mech_sample_06", name: "Akosua Frimpong" },
  { id: "mech_sample_07", name: "Kojo Appiah" },
  { id: "mech_sample_08", name: "Ama Sarpong" },
];

export const SAMPLE_CUSTOMERS = [
  "Nana Adjei",
  "Esi Quaye",
  "Samuel Tetteh",
  "Linda Ofori",
  "Daniel Agyeman",
  "Priscilla Nyarko",
  "Michael Ansah",
  "Gloria Amponsah",
] as const;

export const SAMPLE_SERVICES = [
  "Battery replacement",
  "Brake pad replacement",
  "Engine diagnostics",
  "Oil change",
  "Tyre change",
  "AC repair",
  "Jump start",
  "Suspension check",
] as const;

export function sampleServiceRequestRef(index: number) {
  return `SR-${String(24100 + index).padStart(5, "0")}`;
}
