export type TransactionStatus = string;
export type PayoutStatus = "pending" | "processing" | "completed" | "paid" | "failed";
export type PaymentMethod = "card" | "mobile_money" | "cash";
export type PayoutMethod = string;

export interface MechanicRef {
  id: string;
  name: string;
  businessName?: string | null;
}


export interface CommissionBreakdown {
  headline: string;
  paymentMethod: string;
  customerName: string;
  settledAt: string | null;
  formattedSettledDate: string;
  customerPaymentGross: number;
  formattedCustomerPaymentGross: string;
  customerFee: number | null;
  customerFeePercent: number | null;
  customerFeeLabel: string;
  platformCommission: number;
  platformCommissionPercent: number;
  platformCommissionLabel: string;
  platformPayout: string;
  paymentProcessingFee: number;
  paymentProcessingFeeLabel: string;
  netAmountToSplit: number;
  formattedNetAmountToSplit: string;
  companyShare: number;
  formattedCompanyShare: string;
  mechanicShare: number;
  formattedMechanicShare: string;
}

export interface LegacyCommissionBreakdown {
  grossAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  processingFee: number;
  netAmount: number;
  mechanicSharePercent: number;
  mechanicPayout: number;
  companyShare: number;
}

export interface CompanyTransaction {
  id: string;
  transaction: string;
  transactionId: string;
  timestamp: string;
  formattedDate: string;
  serviceRequest: { id: string; code: string; title: string };
  mechanic: MechanicRef;
  status: string;
  statusCode: TransactionStatus;
  gross: number;
  formattedGross: string;
  companyShare: number;
  formattedCompanyShare: string;
  mechanicShare: number;
  formattedMechanicShare: string;
  currency: string;
  breakdown: CommissionBreakdown;
}

export interface PayoutRecord {
  id: string;
  payout: string;
  payoutId: string;
  mechanic: string;
  mechanicId?: string;
  method: string;
  requested: string;
  requestedAt: string;
  completed: string;
  completedAt: string | null;
  status: string;
  statusCode: PayoutStatus;
  amount: number;
  currency: string;
}

export interface AmountWithCount {
  amount: number;
  count: number;
}

export interface EarningsSummary {
  currency: string;

  period: { from: string; to: string };

  totalEarnings: number;
  pendingPayouts: AmountWithCount;
  completedPayouts: AmountWithCount;
  failedPayouts: AmountWithCount;

  outstandingBalance: number;
}

export interface FinancialPeriod {
  key: string;
  label: string;
  start: string;
  end: string;
}

export interface FinancialStat {
  amount: number;
  formatted: string;
  label: string;
}

export interface PayoutStatistics {
  currency: string;
  period: FinancialPeriod;
  totalPayouts: FinancialStat;
  pendingPayouts: FinancialStat;
  successfulPayouts: FinancialStat;
  failedPayouts: FinancialStat;
}

export interface CompanyEarningsStatistics {
  currency: string;
  period: FinancialPeriod;
  totalEarnings: FinancialStat & { currency: string };
  outstandingBalance: FinancialStat & { currency: string };
}

export interface FinancialStatsParams {
  range?: "7D" | "30D" | "90D";
  fromDate?: string;
  toDate?: string;
}

export interface PeriodParams {
  from?: string;
  to?: string;
}

export interface TransactionListParams extends PeriodParams {
  status?: TransactionStatus | "";
  page?: number;
  limit?: number;
}

export interface PayoutListParams extends PeriodParams {
  status?: PayoutStatus | "all";
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}
