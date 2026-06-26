"use client";

import { useState } from "react";
import { Edit2, Eye, MoreVertical, Trash2, UserCheck, UserX } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { DEFAULT_EMPLOYEE_AVATAR } from "@/features/dashboard/constants/employee-options";
import type { Employee } from "@/features/dashboard/types/employee";
import {
  formatDate,
  formatEmployeeStatus,
  getEmployeeStatusClasses,
  getSpecialtyClasses,
} from "@/features/dashboard/utils/employee-formatters";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

function EmployeeTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 p-5 dark:border-white/10"
        >
          {Array.from({ length: 4 }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="h-4 animate-pulse rounded bg-gray-100 dark:bg-white/10"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmployeeTable({
  employees,
  isLoading = false,
  onView,
  onDelete,
  onDeactivate,
  onActivate,
  onEdit,
}: EmployeeTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (isLoading) {
    return <EmployeeTableSkeleton />;
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        title="No employees found"
        description="Adjust your filters or add a new employee to get started."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <table className="w-full min-w-[1080px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
            {[
              "Name",
              "Date of Birth",
              "Contact",
              "Email",
              "Specialization",
              "Status",
              "Jobs",
              "Actions",
            ].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
          {employees.map((employee) => {
            const birthDate = formatDate(employee.dateOfBirth);

            return (
            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={employee.profilePhotoUrl || DEFAULT_EMPLOYEE_AVATAR}
                    alt={employee.fullName}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {employee.fullName}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white/75">
                  {birthDate ?? "N/A"}
                </p>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white/75">{employee.phoneNumber}</p>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 dark:text-white/75">{employee.email || "-"}</p>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {employee.serviceSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${getSpecialtyClasses(
                        specialty,
                      )}`}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEmployeeStatusClasses(
                    employee.status,
                  )}`}
                >
                  {formatEmployeeStatus(employee.status)}
                </span>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employee.jobsCompleted}
                </p>
              </td>

              <td className="relative px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((currentMenu) =>
                      currentMenu === employee.id ? null : employee.id,
                    )
                  }
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <MoreVertical size={18} className="text-gray-600" />
                </button>

                {openMenu === employee.id ? (
                  <div className="absolute right-6 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#202329]">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onView(employee);
                      }}
                      className="flex w-full items-center gap-2 border-b border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                    >
                      <Eye size={16} />
                      View Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onEdit(employee);
                      }}
                      className="flex w-full items-center gap-2 border-b border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                    >
                      <Edit2 size={16} />
                      Edit Employee
                    </button>
                    {employee.status !== "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onActivate(employee);
                        }}
                        className="flex w-full items-center gap-2 border-b border-gray-200 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:border-white/10 dark:hover:bg-green-500/10"
                      >
                        <UserCheck size={16} />
                        Activate Employee
                      </button>
                    ) : null}
                    {employee.status === "SUSPENDED" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onDelete(employee);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onDeactivate(employee);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <UserX size={16} />
                        Suspend
                      </button>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
