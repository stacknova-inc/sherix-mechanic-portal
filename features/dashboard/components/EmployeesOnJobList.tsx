import { DEFAULT_EMPLOYEE_AVATAR } from "@/features/dashboard/constants/employee-options";
import type { Employee } from "@/features/dashboard/types/employee";

interface EmployeesOnJobListProps {
  employees: Employee[];
  isLoading?: boolean;
}

export function EmployeesOnJobList({
  employees,
  isLoading = false,
}: EmployeesOnJobListProps) {
  const activeEmployees = employees
    .filter((employee) => employee.status === "ACTIVE")
    .slice(0, 5);

  return (
    <section>
      <h3 className="mb-5 text-xl font-extrabold dark:text-white">Active Employees</h3>
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="flex items-center rounded-lg border border-[#eef0f3] bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
            >
              <div className="mr-4 size-11 animate-pulse rounded-full bg-gray-100 dark:bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
              </div>
            </article>
          ))
        ) : activeEmployees.length ? (
        activeEmployees.map((employee) => (
          <article
            key={employee.id}
            className="flex items-center rounded-lg border border-[#eef0f3] bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
          >
            <div className="relative mr-4">
              <img
                src={employee.profilePhotoUrl || DEFAULT_EMPLOYEE_AVATAR}
                alt={employee.fullName}
                className="size-11 rounded-full object-cover"
              />
              
            </div>
            <div className="min-w-0">
              <p className="truncate font-extrabold dark:text-white">{employee.fullName}</p>
              <p className="truncate text-xs text-[#8f96a3]">
                {employee.experienceLevel}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-extrabold text-emerald-600">Active</p>
              <div className="mt-1 flex justify-end">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                >
                  {employee.serviceSpecialties[0]}
                </span>
              </div>
            </div>
          </article>
        ))
        ) : (
          <div className="rounded-lg border border-[#eef0f3] bg-white p-6 text-center text-sm font-semibold text-[#8f96a3] shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
            No active employees found.
          </div>
        )}
      </div>
    </section>
  );
}
