"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllCompanyServiceRequests,
  getCompanyServiceRequestStats,
  getCompanyServiceRequests,
} from "@/features/requests/services/service-requests-service";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";
import type { ServiceRequestFilters } from "@/features/requests/types";

export const companyServiceRequestsQueryKey = ["company-service-requests"] as const;
export const companyServiceRequestStatsQueryKey = [...companyServiceRequestsQueryKey, "stats"] as const;

function useCanFetch() {
  const { hasHydrated, token, user } = useAuthStore();
  return hasHydrated && Boolean(token && isCompanyAdmin(user));
}

export function useCompanyServiceRequests() {
  return useQuery({
    queryKey: companyServiceRequestsQueryKey,
    queryFn: getAllCompanyServiceRequests,
    enabled: useCanFetch(),
  });
}

export function useCompanyServiceRequestPage(filters: ServiceRequestFilters, page: number) {
  const { sort: _sort, ...serverFilters } = filters;
  return useQuery({
    queryKey: [...companyServiceRequestsQueryKey, serverFilters, page],
    queryFn: () => getCompanyServiceRequests(serverFilters, page),
    enabled: useCanFetch(),
  });
}

export function useCompanyServiceRequestStats(filters: ServiceRequestFilters) {
  return useQuery({
    queryKey: [...companyServiceRequestStatsQueryKey, filters],
    queryFn: () => getCompanyServiceRequestStats(filters),
    enabled: useCanFetch(),
  });
}
