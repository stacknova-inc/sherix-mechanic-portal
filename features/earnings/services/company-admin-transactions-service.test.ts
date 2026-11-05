import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import { getTransactions } from "@/features/earnings/services/earnings-service";

const transaction = {
  id: "6ad617fcf69f87bfe9b0b682",
  transaction: "TXN-B0B68A",
  transactionId: "REF-3110L0RJ",
  timestamp: "2026-10-17T13:15:40.379Z",
  formattedDate: "Oct 17, 2026, 1:15 PM",
  serviceRequest: { id: "6ad617fcf69f87bfe9b0b682", code: "SR-0B682", title: "Brake Failure" },
  mechanic: { id: "6ace35b3685f9f325faab977", name: "Gilda", businessName: null },
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

describe("GET /financial/company-admin/transactions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps the API nested transaction list and sends page and limit", async () => {
    const pagination = { total: 10, page: 2, limit: 10, pages: 1 };
    api.get.mockResolvedValue({ data: { success: true, message: "Company transactions retrieved", data: { transactions: [transaction], pagination } } });

    await expect(getTransactions({ page: 2, limit: 10 })).resolves.toEqual({ data: [transaction], pagination });
    expect(api.get).toHaveBeenCalledWith("/financial/company-admin/transactions", { params: { page: 2, limit: 10 } });
  });

  it("rejects an unexpected response shape", async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { data: [] } } });
    await expect(getTransactions()).rejects.toThrow("transaction list response was not in the expected format");
  });
});
