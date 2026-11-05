import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import { getPayouts } from "@/features/earnings/services/earnings-service";

const payload = {
  success: true,
  message: "Company payouts retrieved successfully",
  data: {
    payouts: [
      {
        id: "6ad61802f69f87bfe9b0b6d2",
        payout: "PO-55203",
        payoutId: "payout_po55203",
        mechanic: "Company",
        method: "Bank transfer",
        requested: "Oct 19, 2026",
        requestedAt: "2026-10-19T13:15:46.658Z",
        completed: "Oct 13, 2026",
        completedAt: "2026-10-13T13:15:45.879Z",
        status: "Paid",
        statusCode: "completed",
        amount: 527.85,
        currency: "GHS",
        formattedAmount: "GHS 527.85",
      },
    ],
    pagination: { total: 4, page: 1, limit: 20, pages: 1 },
  },
};

describe("GET /payouts/company-admin/list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the nested payouts payload and sends the documented filters", async () => {
    api.get.mockResolvedValue({ data: payload });

    await expect(getPayouts({ page: 1, limit: 20 })).resolves.toEqual({
      data: payload.data.payouts,
      pagination: payload.data.pagination,
    });
    expect(api.get).toHaveBeenCalledWith("/payouts/company-admin/list", {
      params: { status: "all", fromDate: "", toDate: "", page: 1, limit: 20 },
    });
  });

  it("sends status and both date filters together", async () => {
    api.get.mockResolvedValue({ data: payload });
    await getPayouts({ status: "processing", from: "2026-10-01", to: "2026-10-20", page: 2, limit: 20 });

    expect(api.get).toHaveBeenCalledWith("/payouts/company-admin/list", {
      params: {
        status: "processing",
        fromDate: "2026-10-01",
        toDate: "2026-10-20",
        page: 2,
        limit: 20,
      },
    });
  });

  it("rejects a malformed response instead of silently showing an empty list", async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { payouts: [] } } });
    await expect(getPayouts()).rejects.toThrow("payout list response was not in the expected format");
  });
});
