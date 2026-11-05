import type { MechanicQualityMetrics } from "@/features/performance/types";

export type QualitySortKey =
  | "mechanicName"
  | "acceptanceRate"
  | "avgResponseMinutes"
  | "averageRating"
  | "earnings"
  | "disputeCount";

export type SortDirection = "asc" | "desc";

/** Sorts by the chosen column; mechanics without a value (no ratings) always sort last. */
export function sortQualityMetrics(
  rows: MechanicQualityMetrics[],
  key: QualitySortKey,
  direction: SortDirection,
): MechanicQualityMetrics[] {
  const modifier = direction === "asc" ? 1 : -1;

  return [...rows].sort((first, second) => {
    const a = first[key];
    const b = second[key];

    if (a === null || b === null) {
      return a === b ? 0 : a === null ? 1 : -1;
    }

    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b) * modifier;
    }

    return ((a as number) - (b as number)) * modifier;
  });
}

export function filterQualityMetrics(rows: MechanicQualityMetrics[], search: string) {
  const query = search.trim().toLowerCase();
  return query ? rows.filter((row) => row.mechanicName.toLowerCase().includes(query)) : rows;
}

export function formatMinutes(minutes: number) {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${Math.round(minutes % 60)} min`;
}

export function formatRating(rating: number | null) {
  return rating === null ? "No ratings" : `${rating.toFixed(2)} / 5`;
}
