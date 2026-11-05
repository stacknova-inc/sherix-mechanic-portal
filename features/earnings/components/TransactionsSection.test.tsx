import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";

const service = vi.hoisted(() => ({ getTransactions: vi.fn() }));
vi.mock("@/features/earnings/services/earnings-service", () => service);
vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);

import { TransactionsSection } from "@/features/earnings/components/TransactionsSection";

const record = {
  id: "txn-1",
  transaction: "TXN-B0B68A",
  transactionId: "REF-3110L0RJ",
  timestamp: "2026-10-17T13:15:40.379Z",
  formattedDate: "Oct 17, 2026, 1:15 PM",
  serviceRequest: { id: "sr-1", code: "SR-0B682", title: "Brake Failure" },
  mechanic: { id: "mechanic-1", name: "Gilda", businessName: null },
  status: "Completed",
  statusCode: "completed",
  gross: 371.46,
  currency: "GHS",
  formattedGross: "GHS 371.46",
  companyShare: 62.48,
  formattedCompanyShare: "GHS 62.48",
  mechanicShare: 145.77,
  formattedMechanicShare: "GHS 145.77",
  breakdown: {
    headline: "Mobile money payment from Richard Ofori · settled Oct 17, 2026, 1:15 PM",
    paymentMethod: "Mobile money",
    customerName: "Richard Ofori",
    settledAt: "2026-10-17T13:15:40.379Z",
    formattedSettledDate: "Oct 17, 2026, 1:15 PM",
    customerPaymentGross: 371.46,
    formattedCustomerPaymentGross: "GHS 371.46",
    customerFee: 21.46,
    customerFeePercent: null,
    customerFeeLabel: "GHS 21.46",
    platformCommission: 52.5,
    platformCommissionPercent: 15,
    platformCommissionLabel: "-GHS 52.50",
    platformPayout: "Not available",
    paymentProcessingFee: 110.71,
    paymentProcessingFeeLabel: "-GHS 110.71",
    netAmountToSplit: 208.25,
    formattedNetAmountToSplit: "GHS 208.25",
    companyShare: 62.48,
    formattedCompanyShare: "GHS 62.48",
    mechanicShare: 145.77,
    formattedMechanicShare: "GHS 145.77",
  },
};

describe("TransactionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getTransactions.mockImplementation(async ({ page, limit }) => ({
      data: [record],
      pagination: { total: 20, page, limit, pages: 2 },
    }));
  });

  it("renders API response fields and the backend formatted values", async () => {
    renderWithProviders(<TransactionsSection />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("TXN-B0B68A")).toBeInTheDocument();
    expect(within(table).getByText("SR-0B682")).toBeInTheDocument();
    expect(within(table).getByText("Brake Failure")).toBeInTheDocument();
    expect(within(table).getByText("GHS 371.46")).toBeInTheDocument();

    const toggle = within(table).getByRole("button", { name: /Show commission breakdown/ });
    await userEvent.click(toggle);
    const breakdown = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(breakdown).toHaveTextContent("-GHS 52.50");
    expect(breakdown).toHaveTextContent("GHS 145.77");
    expect(breakdown).toHaveTextContent("GHS 62.48");
  });

  it("requests the next backend page", async () => {
    renderWithProviders(<TransactionsSection />);
    await screen.findByRole("table");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("table");
    expect(service.getTransactions).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
  });
});
