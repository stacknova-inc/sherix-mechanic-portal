"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyIssues } from "@/services/issues-service";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const companyIssuesQueryKey = ["company-issues"] as const;

export function useCompanyIssues() {
  const { hasHydrated, token, user } = useAuthStore();

  return useQuery({
    queryKey: companyIssuesQueryKey,
    queryFn: getCompanyIssues,
    enabled: hasHydrated && Boolean(token && isCompanyAdmin(user)),
  });
}
