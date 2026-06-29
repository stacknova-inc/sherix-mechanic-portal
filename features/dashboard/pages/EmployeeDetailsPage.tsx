"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DEFAULT_EMPLOYEE_AVATAR } from "@/features/dashboard/constants/employee-options";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { useEmployee } from "@/features/dashboard/hooks/useEmployee";
import {
  formatDate,
  formatEmployeeStatus,
  getEmployeeStatusClasses,
  getSpecialtyClasses,
} from "@/features/dashboard/utils/employee-formatters";

interface EmployeeDetailsPageProps {
  employeeId: string;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8f96a3]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export function EmployeeDetailsPage({ employeeId }: EmployeeDetailsPageProps) {
  const router = useRouter();
  const { employee, isLoading, isError, error } = useEmployee(employeeId);

  return (
    <DashboardShell>
      <button
        type="button"
        onClick={() => router.push("/employee")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6f7784] transition hover:text-brand-red dark:text-white/65"
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      {isLoading ? (
        <div className="rounded-lg border border-[#eef0f3] bg-white p-8 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
          <div className="mt-4 h-4 w-72 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
        </div>
      ) : isError || !employee ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Unable to load this employee. Please try again."}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={employee.profilePhotoUrl || DEFAULT_EMPLOYEE_AVATAR}
                  alt={employee.fullName}
                  className="size-16 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white">
                    {employee.fullName}
                  </h1>
                  <p className="text-sm text-[#6f7784] dark:text-white/55">
                    {employee.email || "No email on file"}
                  </p>
                </div>
              </div>
              <span
                className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${getEmployeeStatusClasses(
                  employee.status,
                )}`}
              >
                {formatEmployeeStatus(employee.status)}
              </span>
            </div>
          </section>

          <section className="rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
            <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">
              Contact &amp; Profile
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Phone Number" value={employee.phoneNumber || "N/A"} />
              <DetailItem label="Date of Birth" value={formatDate(employee.dateOfBirth) ?? "N/A"} />
              <DetailItem label="Experience Level" value={employee.experienceLevel} />
              <DetailItem label="Jobs Completed" value={String(employee.jobsCompleted)} />
              <DetailItem label="Onboarded" value={formatDate(employee.onboardedDate) ?? "N/A"} />
              <DetailItem
                label="Last Updated"
                value={
                  new Date(employee.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
            </div>
          </section>

          <section className="rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
            <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">
              Service Specialties
            </h2>
            {employee.serviceSpecialties.length === 0 ? (
              <p className="mt-3 text-sm text-[#6f7784] dark:text-white/55">
                No specialties assigned.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {employee.serviceSpecialties.map((specialty) => (
                  <span
                    key={specialty}
                    className={`inline-block rounded px-3 py-1 text-sm font-medium ${getSpecialtyClasses(
                      specialty,
                    )}`}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
