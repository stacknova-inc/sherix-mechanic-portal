"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCompanyEarningsStatistics,
  getPayouts,
  getPayoutStatistics,
  getTransactions,
} from "@/features/earnings/services/earnings-service";
import type {
  FinancialStatsParams,
  PayoutListParams,
  TransactionListParams,
} from "@/features/earnings/types";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const earningsQueryKeys = {
  all: ["earnings"] as const,
  earningsStats: (period: FinancialStatsParams | null) => ["earnings", "statistics", period] as const,
  payoutStats: (period: FinancialStatsParams | null) => ["earnings", "payout-statistics", period] as const,
  transactions: (params: TransactionListParams) => ["earnings", "transactions", params] as const,
  payouts: (params: PayoutListParams) => ["earnings", "payouts", params] as const,
};

function useCanFetch() {
  const { hasHydrated, token, user } = useAuthStore();
  return hasHydrated && Boolean(token && isCompanyAdmin(user));
}

export function useCompanyEarningsStatistics(period: FinancialStatsParams | null) {
  return useQuery({
    queryKey: earningsQueryKeys.earningsStats(period),
    queryFn: () => getCompanyEarningsStatistics(period ?? {}),
    enabled: useCanFetch() && period !== null,
  });
}

export function usePayoutStatistics(period: FinancialStatsParams | null) {
  return useQuery({
    queryKey: earningsQueryKeys.payoutStats(period),
    queryFn: () => getPayoutStatistics(period ?? {}),
    enabled: useCanFetch() && period !== null,
  });
}

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: earningsQueryKeys.transactions(params),
    queryFn: () => getTransactions(params),
    enabled: useCanFetch(),
    placeholderData: keepPreviousData,
  });
}

export function usePayouts(params: PayoutListParams) {
  return useQuery({
    queryKey: earningsQueryKeys.payouts(params),
    queryFn: () => getPayouts(params),
    enabled: useCanFetch(),
    placeholderData: keepPreviousData,
  });
}
