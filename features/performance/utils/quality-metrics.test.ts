import { describe, expect, it } from "vitest";
import type { MechanicQualityMetrics } from "@/features/performance/types";
import { getPerformanceInsights } from "@/features/performance/services/performance-insights-service";
import {
  filterQualityMetrics,
  formatMinutes,
  formatRating,
  sortQualityMetrics,
} from "@/features/performance/utils/quality-metrics";

function row(mechanicName: string, averageRating: number | null, earnings: number): MechanicQualityMetrics {
  return {
    mechanicId: mechanicName,
    mechanicName,
    acceptanceRate: 0.9,
    avgResponseMinutes: 5,
    averageRating,
    ratingCount: averageRating === null ? 0 : 3,
    earnings,
    disputeCount: 0,
  };
}

const rows = [row("Kofi", 4.2, 300), row("Abena", null, 900), row("Yaw", 4.8, 100)];

describe("sortQualityMetrics", () => {
  it("sorts numbers and names in either direction", () => {
    expect(sortQualityMetrics(rows, "earnings", "desc").map((item) => item.mechanicName)).toEqual(["Abena", "Kofi", "Yaw"]);
    expect(sortQualityMetrics(rows, "mechanicName", "asc").map((item) => item.mechanicName)).toEqual(["Abena", "Kofi", "Yaw"]);
  });

  it("always puts mechanics without ratings last", () => {
    expect(sortQualityMetrics(rows, "averageRating", "desc").map((item) => item.mechanicName)).toEqual(["Yaw", "Kofi", "Abena"]);
    expect(sortQualityMetrics(rows, "averageRating", "asc").map((item) => item.mechanicName)).toEqual(["Kofi", "Yaw", "Abena"]);
  });
});

describe("helpers", () => {
  it("filters by name, case-insensitively", () => {
    expect(filterQualityMetrics(rows, "  kO ").map((item) => item.mechanicName)).toEqual(["Kofi"]);
  });

  it("formats durations and ratings", () => {
    expect(formatMinutes(12.5)).toBe("12.5 min");
    expect(formatMinutes(95)).toBe("1 h 35 min");
    expect(formatRating(4.456)).toBe("4.46 / 5");
    expect(formatRating(null)).toBe("No ratings");
  });
});

describe("getPerformanceInsights", () => {
  it("scopes to the selected mechanic and returns buckets for the period", async () => {
    const all = await getPerformanceInsights({ from: "2026-09-19", to: "2026-09-25", mechanicId: "" });
    expect(all.bucket).toBe("day");
    expect(all.trend).toHaveLength(7);

    const one = await getPerformanceInsights({ from: "", to: "", mechanicId: "mech_sample_02" });
    expect(one.mechanics.map((item) => item.mechanicId)).toEqual(["mech_sample_02"]);
    expect(one.bucket).toBe("week");
    expect(one.totals.earnings).toBe(one.mechanics[0].earnings);

    const none = await getPerformanceInsights({ from: "", to: "", mechanicId: "unknown" });
    expect(none.mechanics).toEqual([]);
    expect(none.totals.averageRating).toBeNull();
  });
});
