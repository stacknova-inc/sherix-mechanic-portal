import { describe, expect, it } from "vitest";
import { SAMPLE_PAYOUTS, SAMPLE_TRANSACTIONS } from "@/features/earnings/mocks/earnings-sample";

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
