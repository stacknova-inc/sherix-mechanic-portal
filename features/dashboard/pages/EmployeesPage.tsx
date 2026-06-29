"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CircleOff,
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
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [statusAction, setStatusAction] = useState<{
    employee: Employee;
    action: "suspend" | "delete";
  } | null>(null);
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
    reactivateEmployee,
    deleteEmployee,
    error,
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
          trend=""
          helper="In roster"
          icon={UsersRound}
          tone="positive"
        />
        <EmployeeStatCard
          title="Active"
          value={stats.active}
          trend=""
          helper="Ready for assignment"
          icon={UserCheck}
          tone="positive"
        />
        <EmployeeStatCard
          title="Inactive"
          value={stats.inactive}
          trend=""
          helper="Not accepting jobs"
          icon={BriefcaseBusiness}
          tone="info"
        />
        <EmployeeStatCard
          title="Suspended"
          value={stats.suspended}
          trend=""
          helper="Restricted from assignments"
          icon={CircleOff}
          tone="danger"
        />
      </div>

      <section className="mt-8 rounded-lg border border-[#eef0f3] bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
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
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-white/10 dark:text-white/65">
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
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-[#202329] dark:text-white"
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
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-[#202329] dark:text-white"
            >
              <option value="all">Status</option>
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end border-t border-gray-200 pt-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-white/60">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  sortBy: event.target.value as EmployeeSortKey,
                }))
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-[#202329] dark:text-white"
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
              onView={(employee) => router.push(`/employee/${employee.id}`)}
              onDelete={(employee) =>
                setStatusAction({ employee, action: "delete" })
              }
              onDeactivate={(employee) =>
                setStatusAction({ employee, action: "suspend" })
              }
              onActivate={(employee) => {
                void reactivateEmployee(employee.id);
              }}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setIsModalOpen(true);
              }}
            />

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 dark:text-white/55 md:flex-row md:items-center md:justify-between">
              <span>
                Showing {filteredEmployees.length} of {totalEmployees} employees
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-50 dark:border-white/10 dark:text-white/65"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-800 dark:text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-50 dark:border-white/10 dark:text-white/65"
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

          if (statusAction.action === "suspend") {
            await deactivateEmployee(statusAction.employee.id);
          } else {
            await deleteEmployee(statusAction.employee.id);
          }

          setStatusAction(null);
        }}
      />
    </DashboardShell>
  );
}
