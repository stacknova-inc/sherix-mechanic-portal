"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  CircleOff,
  Grid3x3,
  Layout,
  Plus,
  Search,
  SlidersHorizontal,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { ConfirmEmployeeStatusModal } from "@/features/dashboard/components/ConfirmEmployeeStatusModal";
import { EmployeeStatCard } from "@/features/dashboard/components/EmployeeStatCard";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import {
  EMPLOYEE_SORT_OPTIONS,
  EMPLOYEE_STATUSES,
} from "@/features/dashboard/constants/employee-options";
import { useEmployees } from "@/features/dashboard/hooks/useEmployees";
import { useServices } from "@/features/dashboard/hooks/useServices";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { AddEmployeeModal } from "@/features/dashboard/modals/AddEmployeeModal";
import { EmployeeTable } from "@/features/dashboard/tables/EmployeeTable";
import type {
  Employee,
  EmployeeSortKey,
  EmployeeStatus,
  ServiceSpecialty,
} from "@/features/dashboard/types/employee";
import type { ServiceOption } from "@/types/service";

export function EmployeesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [statusAction, setStatusAction] = useState<{
    employee: Employee;
    action: "deactivate" | "reactivate";
  } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { data: services = [] } = useServices();
  const {
    filteredEmployees,
    filters,
    isError,
    isLoading,
    isSubmitting,
    page,
    stats,
    totalEmployees,
    totalPages,
    addEmployee,
    deactivateEmployee,
    error,
    reactivateEmployee,
    setPage,
    updateEmployee,
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
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Plus size={18} />
            Add New Employee
          </button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EmployeeStatCard
          title="Total Employees"
          value={stats.total}
          trend="+4.7%"
          helper="from last month"
          icon={UsersRound}
          tone="positive"
        />
        <EmployeeStatCard
          title="Available"
          value={stats.available}
          trend="+3.2%"
          helper="Ready for assignment"
          icon={UserCheck}
          tone="positive"
        />
        <EmployeeStatCard
          title="On Job"
          value={stats.onJob}
          trend="+1.8%"
          helper="Currently assigned"
          icon={BriefcaseBusiness}
          tone="info"
        />
        <EmployeeStatCard
          title="Offline"
          value={stats.offline}
          trend="-1.3%"
          helper="Not accepting jobs"
          icon={CircleOff}
          tone="danger"
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
              {services.map((service: ServiceOption) => (
                <option key={service.id} value={service.id}>
                  {service.name}
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
                  {status === "ON_JOB"
                    ? "On Job"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
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
        {isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : "Unable to load employees. Please try again."}
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={filteredEmployees}
              isLoading={isLoading}
              onDeactivate={(employee) =>
                setStatusAction({ employee, action: "deactivate" })
              }
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setIsModalOpen(true);
              }}
              onReactivate={(employee) =>
                setStatusAction({ employee, action: "reactivate" })
              }
            />

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
              <span>
                Showing {filteredEmployees.length} of {totalEmployees} employees
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-800">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AddEmployeeModal
        employee={editingEmployee}
        isOpen={isModalOpen}
        onClose={() => {
          setEditingEmployee(null);
          setIsModalOpen(false);
        }}
        onSubmit={async (values) => {
          if (editingEmployee) {
            await updateEmployee({
              employeeId: editingEmployee.id,
              input: values,
            });
            return;
          }

          await addEmployee(values);
        }}
        isLoading={isSubmitting}
      />

      <ConfirmEmployeeStatusModal
        employee={statusAction?.employee ?? null}
        action={statusAction?.action ?? null}
        isLoading={isSubmitting}
        onClose={() => setStatusAction(null)}
        onConfirm={async () => {
          if (!statusAction) {
            return;
          }

          if (statusAction.action === "deactivate") {
            await deactivateEmployee(statusAction.employee.id);
          } else {
            await reactivateEmployee(statusAction.employee.id);
          }

          setStatusAction(null);
        }}
      />
    </DashboardShell>
  );
}
