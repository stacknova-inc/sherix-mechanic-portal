"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployeeById } from "@/features/dashboard/services/employee-service";
import { employeesRootQueryKey } from "@/features/dashboard/utils/employee-cache";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const employeeQueryKey = (employeeId: string) =>
  [...employeesRootQueryKey, "detail", employeeId] as const;

export function useEmployee(employeeId: string) {
  const { hasHydrated, token, user } = useAuthStore();
  const canFetchEmployee =
    hasHydrated && Boolean(token && isCompanyAdmin(user) && employeeId);

  const employeeQuery = useQuery({
    queryKey: employeeQueryKey(employeeId),
    queryFn: () => getEmployeeById(employeeId),
    enabled: canFetchEmployee,
  });

  return {
    employee: employeeQuery.data,
    isLoading: employeeQuery.isLoading,
    isError: employeeQuery.isError,
    error: employeeQuery.error,
    refetchEmployee: employeeQuery.refetch,
  };
}
