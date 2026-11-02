"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import {
  deactivateEmployee,
  reactivateEmployee,
} from "@/features/dashboard/services/employee-service";
import type { Employee } from "@/features/dashboard/types/employee";
import {
  employeesRootQueryKey,
  restoreEmployeeCaches,
  snapshotEmployeeCaches,
  updateEmployeeInCaches,
  type EmployeeCacheSnapshot,
} from "@/features/dashboard/utils/employee-cache";

/** PATCH /employees/:id/deactivate and /reactivate, shared by the roster and the detail page. */
export function useEmployeeStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: unknown, _employeeId: string, snapshot: EmployeeCacheSnapshot | undefined) => {
    restoreEmployeeCaches(queryClient, snapshot);
    toast({ type: "error", message: getApiErrorMessage(error) });
  };
  const onSettled = () => queryClient.invalidateQueries({ queryKey: employeesRootQueryKey });

  const deactivateMutation = useMutation({
    mutationFn: deactivateEmployee,
    onMutate: async (employeeId: string) => {
      const snapshot = await snapshotEmployeeCaches(queryClient);
      updateEmployeeInCaches(queryClient, employeeId, (employee) => ({
        ...employee,
        isActive: false,
        status: "SUSPENDED",
      }));
      return snapshot;
    },
    onError,
    onSuccess: (employee: Employee) => {
      updateEmployeeInCaches(queryClient, employee.id, () => employee);
      toast({ type: "success", message: "Employee suspended." });
    },
    onSettled,
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateEmployee,
    onMutate: async (employeeId: string) => {
      const snapshot = await snapshotEmployeeCaches(queryClient);
      updateEmployeeInCaches(queryClient, employeeId, (employee) => ({
        ...employee,
        isActive: true,
        status: "ACTIVE",
      }));
      return snapshot;
    },
    onError,
    onSuccess: (employee: Employee) => {
      updateEmployeeInCaches(queryClient, employee.id, () => employee);
      toast({ type: "success", message: "Employee reactivated." });
    },
    onSettled,
  });

  return {
    deactivateEmployee: deactivateMutation.mutateAsync,
    reactivateEmployee: reactivateMutation.mutateAsync,
    isUpdatingStatus: deactivateMutation.isPending || reactivateMutation.isPending,
  };
}
