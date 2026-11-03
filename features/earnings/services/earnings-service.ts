import type {
  CompanyEarningsStatistics,
  FinancialPeriod,
  FinancialStat,
  FinancialStatsParams,
  Paginated,
  PayoutListParams,
  PayoutRecord,
  PayoutStatistics,
  TransactionListParams,
  CompanyTransaction,
} from "@/features/earnings/types";
import { apiClient } from "@/services/http-client";

function financialQueryParams(params: FinancialStatsParams, defaultRange: "7D" | "30D" | "90D") {
  if (params.fromDate || params.toDate) {
    if (!params.fromDate || !params.toDate) {
      throw new Error("Choose both a start date and an end date for a custom range.");
    }
    return { fromDate: params.fromDate, toDate: params.toDate };
  }
  return { range: params.range ?? defaultRange };
}

function hasFinancialPeriod(value: unknown): value is FinancialPeriod {
  if (!value || typeof value !== "object") return false;
  const period = value as Record<string, unknown>;
  return typeof period.key === "string" && typeof period.label === "string" && typeof period.start === "string" && typeof period.end === "string";
}

function hasFinancialStat(value: unknown): value is FinancialStat {
  if (!value || typeof value !== "object") return false;
  const stat = value as Record<string, unknown>;
  return typeof stat.amount === "number" && typeof stat.formatted === "string" && typeof stat.label === "string";
}

export async function getPayoutStatistics(params: FinancialStatsParams = {}): Promise<PayoutStatistics> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: PayoutStatistics;
  }>("/payouts/company-admin/stats", {
    params: financialQueryParams(params, "90D"),
  });

  const data = response.data?.data;
  if (
    !response.data?.success ||
    !data ||
    typeof data.currency !== "string" ||
    !hasFinancialPeriod(data.period) ||
    !hasFinancialStat(data.totalPayouts) ||
    !hasFinancialStat(data.pendingPayouts) ||
    !hasFinancialStat(data.successfulPayouts) ||
    !hasFinancialStat(data.failedPayouts)
  ) {
    throw new Error("The payout statistics response was not in the expected format.");
  }
  return data;
}

export async function getCompanyEarningsStatistics(params: FinancialStatsParams = {}): Promise<CompanyEarningsStatistics> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: CompanyEarningsStatistics;
  }>("/financial/company-admin/earnings", {
    params: financialQueryParams(params, "7D"),
  });

  const data = response.data?.data;
  if (
    !response.data?.success ||
    !data ||
    typeof data.currency !== "string" ||
    !hasFinancialPeriod(data.period) ||
    !hasFinancialStat(data.totalEarnings) ||
    !hasFinancialStat(data.outstandingBalance)
  ) {
    throw new Error("The earnings statistics response was not in the expected format.");
  }
  return data;
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/earnings/transactions
 * Query: status?: "completed" | "pending" | "failed" | "refunded",
 *        from?: YYYY-MM-DD, to?: YYYY-MM-DD, page?: number (1-based), limit?: number
 * Response: {
 *   data: [{
 *     id, reference, serviceRequestId, serviceRequestRef, serviceName, customerName,
 *     mechanic: { id, name }, status, paymentMethod: "card" | "mobile_money" | "cash",
 *     currency, createdAt, settledAt | null,
 *     breakdown: { grossAmount, platformCommissionRate, platformCommission, processingFee,
 *                  netAmount, mechanicSharePercent, mechanicPayout, companyShare }
 *   }],
 *   pagination: { total, page, limit, pages }
 * }
 * Sorted newest first.
 */
export async function getTransactions(
  params: TransactionListParams = {},
): Promise<Paginated<CompanyTransaction>> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: {
      transactions: CompanyTransaction[];
      pagination: Paginated<CompanyTransaction>["pagination"];
    };
  }>("/financial/company-admin/transactions", {
    params: { page: params.page ?? 1, limit: params.limit ?? 10 },
  });

  if (!response.data?.success || !Array.isArray(response.data.data?.transactions) || !response.data.data.pagination) {
    throw new Error("The transaction list response was not in the expected format.");
  }

  return {
    data: response.data.data.transactions,
    pagination: response.data.data.pagination,
  };
}

/**
 * GET /payouts/company-admin/list
 * Response: { success, message, data: { payouts: PayoutRecord[], pagination } }
 */
export async function getPayouts(params: PayoutListParams = {}): Promise<Paginated<PayoutRecord>> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: {
      payouts: PayoutRecord[];
      pagination: Paginated<PayoutRecord>["pagination"];
    };
  }>("/payouts/company-admin/list", {
    params: {
      status: params.status || "all",
      fromDate: params.from ?? "",
      toDate: params.to ?? "",
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  if (!response.data?.success || !Array.isArray(response.data.data?.payouts) || !response.data.data.pagination) {
    throw new Error("The payout list response was not in the expected format.");
  }

  return {
    data: response.data.data.payouts,
    pagination: response.data.data.pagination,
  };
}
