import { describe, expect, it } from "vitest";
import type { CompanyServiceRequest } from "@/features/requests/types";
import {
  defaultServiceRequestFilters,
  filterServiceRequests,
  parseServiceRequestFilters,
} from "@/features/requests/utils/service-request-filters";
import {
  buildMechanicPerformance,
  buildPerformanceDrillDownHref,
  formatRate,
  getPeriodLabel,
  getPeriodRange,
  parsePerformancePeriod,
} from "@/features/performance/utils/mechanic-performance";

function makeRequest(overrides: Partial<CompanyServiceRequest>): CompanyServiceRequest {
  return {
    id: "id",
    reference: "SR",
    status: "completed",
    customerName: null,
    mechanicId: "kofi",
    mechanicName: "Kofi",
    serviceName: null,
    location: null,
    paymentStatus: null,
    amount: null,
    currency: null,
    date: "2026-09-20T10:00:00",
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const requests = [
  makeRequest({ id: "1" }),
  makeRequest({ id: "2", status: "cancelled" }),
  makeRequest({ id: "3", status: "in_progress" }),
  makeRequest({ id: "4", mechanicId: "ama", mechanicName: "Ama" }),
  makeRequest({ id: "5", mechanicId: "ama", mechanicName: "Ama", date: "2026-06-01T10:00:00" }),
  makeRequest({ id: "6", mechanicId: null, mechanicName: null, status: "cancelled" }),
];

const now = new Date(2026, 8, 25, 15, 0, 0);
const last30 = { ...getPeriodRange("30d", now), mechanic: "" };

describe("periods", () => {
  it("builds an inclusive rolling window ending today", () => {
    expect(getPeriodRange("7d", now)).toEqual({ from: "2026-09-19", to: "2026-09-25" });
    expect(getPeriodRange("30d", now)).toEqual({ from: "2026-08-27", to: "2026-09-25" });
    expect(getPeriodRange("all", now)).toEqual({ from: "", to: "" });
  });

  it("labels every period and falls back to the default for unknown values", () => {
    expect(getPeriodLabel("90d")).toBe("Last 90 days");
    expect(parsePerformancePeriod("all")).toBe("all");
    expect(parsePerformancePeriod("forever")).toBe("30d");
    expect(parsePerformancePeriod(null)).toBe("30d");
  });
});

describe("buildMechanicPerformance", () => {
  it("counts outcomes per mechanic within the period", () => {
    const summary = buildMechanicPerformance(requests, last30);

    expect(summary.rows).toEqual([
      expect.objectContaining({ mechanicKey: "ama", assigned: 1, completed: 1, cancelled: 0, cancellationRate: 0 }),
      expect.objectContaining({ mechanicKey: "kofi", assigned: 3, completed: 1, cancelled: 1, cancellationRate: 1 / 3 }),
    ]);
    expect(summary.unassigned).toBe(1);
    expect(summary.totals).toEqual({ assigned: 5, completed: 2, cancelled: 2, cancellationRate: 2 / 5 });
  });

  it("widens when the period changes", () => {
    const summary = buildMechanicPerformance(requests, { from: "", to: "", mechanic: "" });
    expect(summary.rows.find((row) => row.mechanicKey === "ama")?.assigned).toBe(2);
  });

  it("restricts every metric to the selected mechanic", () => {
    const summary = buildMechanicPerformance(requests, { ...last30, mechanic: "kofi" });

    expect(summary.rows.map((row) => row.mechanicKey)).toEqual(["kofi"]);
    expect(summary.totals).toEqual({ assigned: 3, completed: 1, cancelled: 1, cancellationRate: 1 / 3 });
    expect(summary.unassigned).toBe(0);
  });

  it("returns an empty, rate-less summary when nothing is in scope", () => {
    const summary = buildMechanicPerformance(requests, { from: "2020-01-01", to: "2020-01-31", mechanic: "" });

    expect(summary.rows).toEqual([]);
    expect(summary.totals.cancellationRate).toBeNull();
    expect(formatRate(summary.totals.cancellationRate)).toBe("Not available");
  });

  it("reconciles each count with the Service Requests its drill-down link shows", () => {
    const summary = buildMechanicPerformance(requests, last30);
    const drillDownCount = (href: string) => {
      const params = new URLSearchParams(href.split("?")[1] ?? "");
      return filterServiceRequests(requests, parseServiceRequestFilters(params)).length;
    };

    expect(drillDownCount(buildPerformanceDrillDownHref(last30, "completed"))).toBe(summary.totals.completed);
    expect(drillDownCount(buildPerformanceDrillDownHref(last30, "cancelled"))).toBe(summary.totals.cancelled);
    expect(drillDownCount(buildPerformanceDrillDownHref(last30))).toBe(summary.totals.assigned);

    summary.rows.forEach((row) => {
      expect(drillDownCount(buildPerformanceDrillDownHref(last30, "completed", row.mechanicKey))).toBe(row.completed);
      expect(drillDownCount(buildPerformanceDrillDownHref(last30, "cancelled", row.mechanicKey))).toBe(row.cancelled);
      expect(drillDownCount(buildPerformanceDrillDownHref(last30, undefined, row.mechanicKey))).toBe(row.assigned);
    });
  });

  it("carries the period and filters into drill-down links", () => {
    expect(buildPerformanceDrillDownHref(last30, "cancelled", "kofi")).toBe(
      "/requests?status=cancelled&mechanic=kofi&from=2026-08-27&to=2026-09-25",
    );
    expect(filterServiceRequests(requests, defaultServiceRequestFilters)).toHaveLength(requests.length);
  });
});

describe("formatRate", () => {
  it("formats rates as percentages with at most one decimal", () => {
    expect(formatRate(1 / 3)).toBe("33.3%");
    expect(formatRate(0)).toBe("0%");
  });
});
