import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import { getCompanyEarningsStatistics, getPayoutStatistics } from "@/features/earnings/services/earnings-service";

describe("company-admin financial statistics endpoints", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads payout statistics for the selected range and preserves backend labels/formats", async () => {
    const data = {
      currency: "GHS",
      period: { key: "90D", label: "Last 90 days", start: "2026-07-22T12:51:35.462Z", end: "2026-10-20T12:51:35.462Z" },
      totalPayouts: { amount: 1479.85, formatted: "GHS 1,479.85", label: "4 payouts requested" },
      pendingPayouts: { amount: 434.35, formatted: "GHS 434.35", label: "2 payouts pending or processing" },
      successfulPayouts: { amount: 1045.5, formatted: "GHS 1,045.50", label: "2 payouts paid to mechanics" },
      failedPayouts: { amount: 0, formatted: "GHS 0.00", label: "0 payouts need attention" },
    };
    api.get.mockResolvedValue({ data: { success: true, message: "Company payout stats retrieved successfully", data } });

    await expect(getPayoutStatistics({ range: "90D" })).resolves.toEqual(data);
    expect(api.get).toHaveBeenCalledWith("/payouts/company-admin/stats", { params: { range: "90D" } });
  });

  it("sends both custom dates without a predefined period", async () => {
    const data = {
      currency: "GHS",
      period: { key: "custom", label: "Custom range", start: "2026-10-01", end: "2026-10-20" },
      totalPayouts: { amount: 0, formatted: "GHS 0.00", label: "0 payouts requested" },
      pendingPayouts: { amount: 0, formatted: "GHS 0.00", label: "0 payouts pending or processing" },
      successfulPayouts: { amount: 0, formatted: "GHS 0.00", label: "0 payouts paid to mechanics" },
      failedPayouts: { amount: 0, formatted: "GHS 0.00", label: "0 payouts need attention" },
    };
    api.get.mockResolvedValue({ data: { success: true, data } });

    await getPayoutStatistics({ fromDate: "2026-10-01", toDate: "2026-10-20" });
    expect(api.get).toHaveBeenCalledWith("/payouts/company-admin/stats", {
      params: { fromDate: "2026-10-01", toDate: "2026-10-20" },
    });
  });

  it("loads earnings statistics from the dedicated company-admin endpoint", async () => {
    const data = {
      currency: "GHS",
      period: { key: "7D", label: "Last 7 days", start: "2026-10-13T13:01:50.151Z", end: "2026-10-20T13:01:50.151Z" },
      totalEarnings: { amount: 155.3, currency: "GHS", formatted: "GHS 155.30", label: "Company share of completed transactions" },
      outstandingBalance: { amount: 762.45, currency: "GHS", formatted: "GHS 762.45", label: "Company share not yet settled" },
    };
    api.get.mockResolvedValue({ data: { success: true, message: "Company earnings retrieved", data } });

    await expect(getCompanyEarningsStatistics({ range: "7D" })).resolves.toEqual(data);
    expect(api.get).toHaveBeenCalledWith("/financial/company-admin/earnings", { params: { range: "7D" } });
  });

  it("requires both custom dates", async () => {
    await expect(getCompanyEarningsStatistics({ fromDate: "2026-10-01" })).rejects.toThrow("Choose both a start date and an end date");
    expect(api.get).not.toHaveBeenCalled();
  });
});
