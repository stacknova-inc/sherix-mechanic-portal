"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEmployee,
  getEmployees,
  getEmployeeStats,
} from "@/features/dashboard/services/employee-service";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeFilters,
  EmployeeStats,
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

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats>(defaultStats);
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const [employeeData, employeeStats] = await Promise.all([
        getEmployees(),
        getEmployeeStats(),
      ]);

      setEmployees(employeeData);
      setStats(employeeStats);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const addEmployee = useCallback(async (employeeData: CreateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      const newEmployee = await createEmployee(employeeData);

      setEmployees((currentEmployees) => [...currentEmployees, newEmployee]);
      setStats((currentStats) => ({
        ...currentStats,
        total: currentStats.total + 1,
        available:
          employeeData.status === "AVAILABLE"
            ? currentStats.available + 1
            : currentStats.available,
        onJob:
          employeeData.status === "ON_JOB"
            ? currentStats.onJob + 1
            : currentStats.onJob,
        offline:
          employeeData.status === "OFFLINE"
            ? currentStats.offline + 1
            : currentStats.offline,
      }));
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const filteredEmployees = useMemo(
    () => filterAndSortEmployees(employees, filters),
    [employees, filters],
  );

  return {
    employees,
    filteredEmployees,
    filters,
    isLoading,
    isSubmitting,
    stats,
    addEmployee,
    setFilters,
  };
}
