"use client";

import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/services-service";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const servicesQueryKey = ["services"] as const;

export function useServices() {
  const { hasHydrated, token, user } = useAuthStore();

  return useQuery({
    queryKey: servicesQueryKey,
    queryFn: getServices,
    enabled: hasHydrated && Boolean(token && isCompanyAdmin(user)),
  });
}
