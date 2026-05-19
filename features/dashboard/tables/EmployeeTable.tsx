"use client";

import { useState } from "react";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
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
}

export function EmployeeTable({ employees, isLoading = false }: EmployeeTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (isLoading) {
    return <EmptyState title="Loading employees..." />;
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
    <div className="overflow-x-auto rounded-lg border border-[#eef0f3] bg-white shadow-card">
      <table className="w-full min-w-[920px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {["Name", "Contact", "Email", "Specialization", "Status", "Jobs", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={employee.profilePhotoUrl || DEFAULT_EMPLOYEE_AVATAR}
                    alt={employee.fullName}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Born {formatDate(employee.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{employee.phoneNumber}</p>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{employee.email || "-"}</p>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {employee.serviceSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-block rounded px-2 py-1 text-xs font-medium "
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
                <p className="text-sm font-medium text-gray-900">
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
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <MoreVertical size={18} className="text-gray-600" />
                </button>

                {openMenu === employee.id ? (
                  <div className="absolute right-6 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-b border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 size={16} />
                      Edit Employee
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete Employee
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
