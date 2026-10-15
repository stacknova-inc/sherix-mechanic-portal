"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getEarningsSummary,
  getPayouts,
  getTransactions,
} from "@/features/earnings/services/earnings-service";
import type {
  PayoutListParams,
  PeriodParams,
  TransactionListParams,
} from "@/features/earnings/types";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const earningsQueryKeys = {
  all: ["earnings"] as const,
  summary: (period: PeriodParams) => ["earnings", "summary", period] as const,
  transactions: (params: TransactionListParams) => ["earnings", "transactions", params] as const,
  payouts: (params: PayoutListParams) => ["earnings", "payouts", params] as const,
};

function useCanFetch() {
  const { hasHydrated, token, user } = useAuthStore();
  return hasHydrated && Boolean(token && isCompanyAdmin(user));
}

export function useEarningsSummary(period: PeriodParams) {
  return useQuery({
    queryKey: earningsQueryKeys.summary(period),
    queryFn: () => getEarningsSummary(period),
    enabled: useCanFetch(),
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
