import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";

const service = vi.hoisted(() => ({ getPayouts: vi.fn() }));
vi.mock("@/features/earnings/services/earnings-service", () => service);
vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);

import { PayoutHistory } from "@/features/earnings/components/PayoutHistory";

describe("PayoutHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getPayouts.mockResolvedValue({
      data: [{
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
      }],
      pagination: { total: 4, page: 1, limit: 20, pages: 1 },
    });
  });

  it("renders payout fields from the company-admin API response", async () => {
    renderWithProviders(<PayoutHistory />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("PO-55203")).toBeInTheDocument();
    expect(within(table).getByText("payout_po55203")).toBeInTheDocument();
    expect(within(table).getByText("Company")).toBeInTheDocument();
    expect(within(table).getByText("Bank transfer")).toBeInTheDocument();
    expect(within(table).getByText("Oct 19, 2026")).toBeInTheDocument();
    expect(within(table).getByText("Oct 13, 2026")).toBeInTheDocument();
    expect(within(table).getByText("Paid")).toBeInTheDocument();
    expect(within(table).getByText("GHS 527.85")).toBeInTheDocument();
    expect(service.getPayouts).toHaveBeenCalledWith({ status: "all", from: "", to: "", page: 1, limit: 20 });
  });
});
