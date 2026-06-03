import { Wrench } from "lucide-react";
import { DEFAULT_EMPLOYEE_AVATAR } from "@/features/dashboard/constants/employee-options";
import { mockEmployees } from "@/features/dashboard/mocks/employee-mock-data";
import { getSpecialtyClasses } from "@/features/dashboard/utils/employee-formatters";

export function EmployeesOnJobList() {
  const employeesOnJob = mockEmployees.filter(
    (employee) => employee.status === "ON_JOB",
  );

  return (
    <section>
      <h3 className="mb-5 text-xl font-extrabold dark:text-white">Employees On Job</h3>
      <div className="space-y-3">
        {employeesOnJob.map((employee) => (
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
              <p className="text-xs font-extrabold text-red-400">ON JOB</p>
              <div className="mt-1 flex justify-end">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                >
                  {employee.serviceSpecialties[0]}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
