"use client";

import { useMemo, useState } from "react";
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import {
  createEmployee,
  deactivateEmployee,
  getEmployees,
  getEmployeeStats,
  reactivateEmployee,
  updateEmployee,
} from "@/features/dashboard/services/employee-service";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeFilters,
  EmployeeListParams,
  EmployeeStats,
  PaginatedEmployees,
  UpdateEmployeeInput,
} from "@/features/dashboard/types/employee";
import { filterAndSortEmployees } from "@/features/dashboard/utils/employee-formatters";

const defaultStats: EmployeeStats = {
  total: 0,
  available: 0,
  onJob: 0,
  offline: 0,
};

const defaultFilters: EmployeeFilters = {
  searchTerm: "",
  serviceType: "all",
  status: "all",
  sortBy: "mostActive",
};

export const employeesQueryKey = (params: EmployeeListParams) =>
  ["employees", params] as const;

function updateEmployeeInCache(
  currentData: PaginatedEmployees | undefined,
  updatedEmployee: Employee,
): PaginatedEmployees | undefined {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    employees: currentData.employees.map((employee) =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee,
    ),
  };
}

export function useEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const limit = 10;

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

  const createMutation = useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: () => {
      toast({ type: "success", message: "Employee created successfully." });
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
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
      queryClient.setQueriesData<PaginatedEmployees>(
        { queryKey: ["employees"] },
        (currentData: PaginatedEmployees | undefined) =>
          updateEmployeeInCache(currentData, updatedEmployee),
      );
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateEmployee,
    onMutate: async (employeeId: string) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      const previousData = queryClient.getQueriesData<PaginatedEmployees>({
        queryKey: ["employees"],
      });

      queryClient.setQueriesData<PaginatedEmployees>(
        { queryKey: ["employees"] },
        (currentData: PaginatedEmployees | undefined) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            employees: currentData.employees.map((employee: Employee) =>
              employee.id === employeeId
                ? { ...employee, isActive: false, status: "SUSPENDED" }
                : employee,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (
      error: unknown,
      _employeeId: string,
      context:
        | { previousData: Array<[QueryKey, PaginatedEmployees | undefined]> }
        | undefined,
    ) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
    onSuccess: () => {
      toast({ type: "success", message: "Employee deactivated." });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateEmployee,
    onSuccess: (updatedEmployee: Employee) => {
      toast({ type: "success", message: "Employee reactivated." });
      queryClient.setQueriesData<PaginatedEmployees>(
        { queryKey: ["employees"] },
        (currentData: PaginatedEmployees | undefined) =>
          updateEmployeeInCache(currentData, updatedEmployee),
      );
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
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
      deactivateMutation.isPending ||
      reactivateMutation.isPending,
    stats,
    page: paginatedEmployees?.page ?? page,
    totalPages: paginatedEmployees?.totalPages ?? 1,
    totalEmployees: paginatedEmployees?.total ?? employees.length,
    addEmployee: createMutation.mutateAsync,
    updateEmployee: updateMutation.mutateAsync,
    deactivateEmployee: deactivateMutation.mutateAsync,
    reactivateEmployee: reactivateMutation.mutateAsync,
    setFilters,
    setPage,
    refetchEmployees: employeesQuery.refetch,
  };
}
