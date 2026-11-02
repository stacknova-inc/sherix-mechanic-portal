import type {
  EarningsSummary,
  Paginated,
  PayoutListParams,
  PayoutRecord,
  PeriodParams,
  TransactionListParams,
  CompanyTransaction,
} from "@/features/earnings/types";
import { SAMPLE_PAYOUTS, SAMPLE_TRANSACTIONS } from "@/features/earnings/mocks/earnings-sample";
import { isWithinDateRange } from "@/features/requests/utils/service-request-filters";
import { mockRequest, paginateMock } from "@/mocks/mock-request";
import { SAMPLE_CURRENCY, roundMoney } from "@/mocks/sample-data";

function inPeriod(value: string, period: PeriodParams) {
  return isWithinDateRange(value, period.from ?? "", period.to ?? "");
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return roundMoney(items.reduce((sum, item) => sum + getValue(item), 0));
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/earnings/summary
 * Query: from?: YYYY-MM-DD, to?: YYYY-MM-DD (inclusive, company timezone)
 * Response: {
 *   currency: "GHS",
 *   period: { from, to },
 *   totalEarnings: number,                         // company share of completed transactions
 *   pendingPayouts:   { amount: number, count: number },  // status pending | processing
 *   completedPayouts: { amount: number, count: number },  // status paid
 *   failedPayouts:    { amount: number, count: number },
 *   outstandingBalance: number                     // company share not yet settled
 * }
 * Totals must be computed server-side and reconcile with /company/earnings/transactions.
 */
export async function getEarningsSummary(period: PeriodParams = {}): Promise<EarningsSummary> {
  return mockRequest("earnings", () => {
    const transactions = SAMPLE_TRANSACTIONS.filter((item) => inPeriod(item.createdAt, period));
    const payouts = SAMPLE_PAYOUTS.filter((item) => inPeriod(item.initiatedAt, period));
    const payoutTotals = (statuses: PayoutRecord["status"][]) => {
      const matching = payouts.filter((payout) => statuses.includes(payout.status));
      return { amount: sumBy(matching, (payout) => payout.amount), count: matching.length };
    };

    return {
      currency: SAMPLE_CURRENCY,
      period: { from: period.from ?? "", to: period.to ?? "" },
      totalEarnings: sumBy(
        transactions.filter((item) => item.status === "completed"),
        (item) => item.breakdown.companyShare,
      ),
      pendingPayouts: payoutTotals(["pending", "processing"]),
      completedPayouts: payoutTotals(["paid"]),
      failedPayouts: payoutTotals(["failed"]),
      outstandingBalance: sumBy(
        transactions.filter((item) => item.status === "pending"),
        (item) => item.breakdown.companyShare,
      ),
    };
  });
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
  return mockRequest("earnings", () => {
    const filtered = SAMPLE_TRANSACTIONS.filter(
      (item) => (!params.status || item.status === params.status) && inPeriod(item.createdAt, params),
    );
    return paginateMock(filtered, params.page, params.limit);
  });
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/payouts
 * Query: status?: "pending" | "processing" | "paid" | "failed",
 *        from?: YYYY-MM-DD, to?: YYYY-MM-DD, page?: number, limit?: number
 * Response: {
 *   data: [{
 *     id, reference, mechanic: { id, name }, amount, currency,
 *     status, method: "mobile_money" | "bank_transfer",
 *     initiatedAt, completedAt | null, failureReason | null, transactionIds: string[]
 *   }],
 *   pagination: { total, page, limit, pages }
 * }
 */
export async function getPayouts(params: PayoutListParams = {}): Promise<Paginated<PayoutRecord>> {
  return mockRequest("earnings", () => {
    const filtered = SAMPLE_PAYOUTS.filter(
      (item) => (!params.status || item.status === params.status) && inPeriod(item.initiatedAt, params),
    );
    return paginateMock(filtered, params.page, params.limit);
  });
}
