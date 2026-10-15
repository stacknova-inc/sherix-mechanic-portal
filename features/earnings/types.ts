export type TransactionStatus = "completed" | "pending" | "failed" | "refunded";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";
export type PaymentMethod = "card" | "mobile_money" | "cash";
export type PayoutMethod = "mobile_money" | "bank_transfer";

export interface MechanicRef {
  id: string;
  name: string;
}


export interface CommissionBreakdown {
  grossAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  processingFee: number;
  netAmount: number;
  mechanicSharePercent: number;
  customerFee: number;
  customerFeeRate: number;
}

export interface CompanyTransaction {
  id: string;
  reference: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  serviceName: string;
  customerName: string;
  mechanic: MechanicRef;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  createdAt: string;
  settledAt: string | null;
  breakdown: CommissionBreakdown;
}

export interface PayoutRecord {
  id: string;
  reference: string;
  mechanic: MechanicRef;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  initiatedAt: string;
  completedAt: string | null;
  failureReason: string | null;
  transactionIds: string[];
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
  status?: PayoutStatus | "";
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}
