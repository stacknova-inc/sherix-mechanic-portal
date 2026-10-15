"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPerformanceInsights } from "@/features/performance/services/performance-insights-service";
import type { PerformanceInsightsParams } from "@/features/performance/types";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const performanceInsightsQueryKey = (params: PerformanceInsightsParams) =>
  ["performance-insights", params] as const;

export function usePerformanceInsights(params: PerformanceInsightsParams) {
  const { hasHydrated, token, user } = useAuthStore();

  return useQuery({
    queryKey: performanceInsightsQueryKey(params),
    queryFn: () => getPerformanceInsights(params),
    enabled: hasHydrated && Boolean(token && isCompanyAdmin(user)),
    placeholderData: keepPreviousData,
  });
}
