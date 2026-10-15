import { describe, expect, it } from "vitest";
import { SAMPLE_PAYOUTS, SAMPLE_TRANSACTIONS } from "@/features/earnings/mocks/earnings-sample";
import { getEarningsSummary, getPayouts, getTransactions } from "@/features/earnings/services/earnings-service";
import { isWithinDateRange } from "@/features/requests/utils/service-request-filters";
import { getPeriodRange } from "@/lib/periods";

const cents = (value: number) => Math.round(value * 100);

describe("sample earnings data", () => {
  it("splits every transaction so the parts add up to the gross amount", () => {
    SAMPLE_TRANSACTIONS.forEach(({ breakdown }) => {
      const parts = breakdown.platformCommission + breakdown.processingFee + breakdown.mechanicPayout + breakdown.companyShare;
      expect(cents(parts)).toBe(cents(breakdown.grossAmount));
      expect(cents(breakdown.mechanicPayout + breakdown.companyShare)).toBe(cents(breakdown.netAmount));
    });
  });

  it("builds payouts from the transactions they pay out", () => {
    SAMPLE_PAYOUTS.forEach((payout) => {
      const total = SAMPLE_TRANSACTIONS
        .filter((transaction) => payout.transactionIds.includes(transaction.id))
        .reduce((sum, transaction) => sum + transaction.breakdown.mechanicPayout, 0);
      expect(cents(total)).toBe(cents(payout.amount));
    });
  });
});

describe("getEarningsSummary", () => {
  it("reconciles with the transactions and payouts in the same period", async () => {
    const period = getPeriodRange("30d");
    const summary = await getEarningsSummary(period);
    const inPeriod = SAMPLE_TRANSACTIONS.filter((item) => isWithinDateRange(item.createdAt, period.from, period.to));
    const completedShare = inPeriod
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + item.breakdown.companyShare, 0);

    expect(summary.currency).toBe("GHS");
    expect(summary.period).toEqual(period);
    expect(cents(summary.totalEarnings)).toBe(cents(completedShare));

    const payouts = await getPayouts({ ...period, status: "failed", limit: 500 });
    expect(summary.failedPayouts.count).toBe(payouts.pagination.total);
  });
});

describe("getTransactions", () => {
  it("filters by status and paginates with the list envelope", async () => {
    const result = await getTransactions({ status: "failed", page: 1, limit: 5 });

    expect(result.data.every((item) => item.status === "failed")).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(5);
    expect(result.pagination).toMatchObject({ page: 1, limit: 5 });
    expect(result.pagination.pages).toBe(Math.max(1, Math.ceil(result.pagination.total / 5)));
  });

  it("returns an empty page for a range with no activity", async () => {
    const result = await getTransactions({ from: "2001-01-01", to: "2001-01-31" });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});
