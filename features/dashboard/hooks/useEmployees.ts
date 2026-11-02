"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  getEmployeeStats,
  updateEmployee,
} from "@/features/dashboard/services/employee-service";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeFilters,
  EmployeeListParams,
  EmployeeStats,
  UpdateEmployeeInput,
} from "@/features/dashboard/types/employee";
import { useEmployeeStatus } from "@/features/dashboard/hooks/useEmployeeStatus";
import {
  employeesRootQueryKey,
  removeEmployeeFromCaches,
  restoreEmployeeCaches,
  snapshotEmployeeCaches,
  updateEmployeeInCaches,
} from "@/features/dashboard/utils/employee-cache";
import { filterAndSortEmployees } from "@/features/dashboard/utils/employee-formatters";

const defaultStats: EmployeeStats = {
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
};

const defaultFilters: EmployeeFilters = {
  searchTerm: "",
  serviceType: "all",
  status: "all",
  sortBy: "mostActive",
};

export const employeesQueryKey = (params: EmployeeListParams) =>
  [...employeesRootQueryKey, params] as const;

export function useEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasHydrated, token, user } = useAuthStore();
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const limit = 10;
  const canFetchEmployees = hasHydrated && Boolean(token && isCompanyAdmin(user));

  const queryParams = useMemo<EmployeeListParams>(
    () => ({
      page,
      limit,
      search: filters.searchTerm,
      status: filters.status,
      serviceId: filters.serviceType,
    }),
    [filters.searchTerm, filters.serviceType, filters.status, page],
  );

  const employeesQuery = useQuery({
    queryKey: employeesQueryKey(queryParams),
    queryFn: () => getEmployees(queryParams),
    enabled: canFetchEmployees,
  });

  const paginatedEmployees = employeesQuery.data;
  const employees = paginatedEmployees?.employees ?? [];
  const filteredEmployees = useMemo(
    () => filterAndSortEmployees(employees, filters),
    [employees, filters],
  );

  const stats = useMemo(
    () => (employees.length ? getEmployeeStats(employees) : defaultStats),
    [employees],
  );

  const { deactivateEmployee, reactivateEmployee, isUpdatingStatus } = useEmployeeStatus();

  const createMutation = useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: () => {
      toast({ type: "success", message: "Employee created successfully." });
      void queryClient.invalidateQueries({ queryKey: employeesRootQueryKey });
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      employeeId,
      input,
    }: {
      employeeId: string;
      input: UpdateEmployeeInput;
    }) => updateEmployee(employeeId, input),
    onSuccess: (updatedEmployee: Employee) => {
      toast({ type: "success", message: "Employee updated successfully." });
      updateEmployeeInCaches(queryClient, updatedEmployee.id, () => updatedEmployee);
      void queryClient.invalidateQueries({ queryKey: employeesRootQueryKey });
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onMutate: async (employeeId: string) => {
      const snapshot = await snapshotEmployeeCaches(queryClient);
      removeEmployeeFromCaches(queryClient, employeeId);
      return snapshot;
    },
    onError: (error: unknown, _employeeId, snapshot) => {
      restoreEmployeeCaches(queryClient, snapshot);
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
    onSuccess: () => {
      toast({ type: "success", message: "Employee deleted." });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: employeesRootQueryKey });
    },
  });

  return {
    employees,
    filteredEmployees,
    filters,
    isError: employeesQuery.isError,
    error: employeesQuery.error,
    isLoading: employeesQuery.isLoading,
    isFetching: employeesQuery.isFetching,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      isUpdatingStatus ||
      deleteMutation.isPending,
    stats,
    page: paginatedEmployees?.page ?? page,
    totalPages: paginatedEmployees?.totalPages ?? 1,
    totalEmployees: paginatedEmployees?.total ?? employees.length,
    addEmployee: createMutation.mutateAsync,
    updateEmployee: updateMutation.mutateAsync,
    deactivateEmployee,
    reactivateEmployee,
    deleteEmployee: deleteMutation.mutateAsync,
    setFilters,
    setPage,
    refetchEmployees: employeesQuery.refetch,
  };
}
