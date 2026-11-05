import { toDateInputValue } from "@/features/requests/utils/service-request-filters";

/** Rolling reporting periods shared by Earnings and Mechanic Performance. */
export type ReportingPeriod = "7d" | "30d" | "90d" | "all";

export const REPORTING_PERIODS: Array<{ value: ReportingPeriod; label: string; days: number | null }> = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

export const DEFAULT_REPORTING_PERIOD: ReportingPeriod = "30d";

export function parseReportingPeriod(value: string | null): ReportingPeriod {
  return REPORTING_PERIODS.some((period) => period.value === value)
    ? (value as ReportingPeriod)
    : DEFAULT_REPORTING_PERIOD;
}

export function getPeriodLabel(period: ReportingPeriod): string {
  return REPORTING_PERIODS.find((option) => option.value === period)?.label ?? "";
}

/** Rolling window ending today (inclusive), in local YYYY-MM-DD; "" means unbounded. */
export function getPeriodRange(period: ReportingPeriod, now = new Date()): { from: string; to: string } {
  const days = REPORTING_PERIODS.find((option) => option.value === period)?.days ?? null;

  if (days === null) {
    return { from: "", to: "" };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  return { from: toDateInputValue(start), to: toDateInputValue(now) };
}
