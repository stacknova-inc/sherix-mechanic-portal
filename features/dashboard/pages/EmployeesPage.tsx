"use client";

import { useState } from "react";
import { Grid3x3, Layout, Plus, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { StatCard } from "@/features/dashboard/components/StatCard";
import {
  EMPLOYEE_SORT_OPTIONS,
  EMPLOYEE_STATUSES,
  SERVICE_SPECIALTIES,
} from "@/features/dashboard/constants/employee-options";
import { useEmployees } from "@/features/dashboard/hooks/useEmployees";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { AddEmployeeModal } from "@/features/dashboard/modals/AddEmployeeModal";
import { EmployeeTable } from "@/features/dashboard/tables/EmployeeTable";
import type {
  EmployeeSortKey,
  EmployeeStatus,
  ServiceSpecialty,
} from "@/features/dashboard/types/employee";

export function EmployeesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const {
    filteredEmployees,
    filters,
    isLoading,
    isSubmitting,
    stats,
    addEmployee,
    setFilters,
  } = useEmployees();

  return (
    <DashboardShell>
      <PageHeader
        title="Employees"
        description="Manage your mechanic fleet, track performance, and assign jobs."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Plus size={18} />
            Add New Employee
          </button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={stats.total}
          helper="Registered team members"
          icon={UsersRound}
        />
        <StatCard
          label="Available"
          value={stats.available}
          helper="Ready for assignment"
          icon={UsersRound}
          valueClassName="text-green-600"
        />
        <StatCard
          label="On Job"
          value={stats.onJob}
          helper="Currently assigned"
          icon={UsersRound}
          valueClassName="text-blue-600"
        />
        <StatCard
          label="Offline"
          value={stats.offline}
          helper="Not accepting jobs"
          icon={UsersRound}
          valueClassName="text-gray-400"
        />
      </div>

      <section className="mt-8 rounded-lg border border-[#eef0f3] bg-white p-4 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, specialization, email, or phone..."
              value={filters.searchTerm}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  searchTerm: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="List view"
              >
                <Layout size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
            </div>

            <span className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
              <SlidersHorizontal size={16} />
              Filters
            </span>

            <select
              value={filters.serviceType}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  serviceType: event.target.value as ServiceSpecialty | "all",
                }))
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Service Type</option>
              {SERVICE_SPECIALTIES.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  status: event.target.value as EmployeeStatus | "all",
                }))
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Status</option>
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ON_JOB" ? "On Job" : status.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  sortBy: event.target.value as EmployeeSortKey,
                }))
              }
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {EMPLOYEE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <EmployeeTable employees={filteredEmployees} isLoading={isLoading} />
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addEmployee}
        isLoading={isSubmitting}
      />
    </DashboardShell>
  );
}
