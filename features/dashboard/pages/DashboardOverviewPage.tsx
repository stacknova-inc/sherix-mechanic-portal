"use client";

import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock3, UsersRound, Zap } from "lucide-react";
import { ActiveRequestsTable } from "@/features/dashboard/components/ActiveRequestsTable";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useEmployees } from "@/features/dashboard/hooks/useEmployees";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { EmployeesOnJobList } from "../components/EmployeesOnJobList";
import { useCompanyServiceRequests } from "@/features/requests/hooks/useCompanyServiceRequests";
import {
  COMPLETED_STATUS,
  isAwaitingMechanic,
  isOpenServiceRequest,
} from "@/features/requests/utils/service-request-status";
import { useAuthStore } from "@/store/auth-store";

export function DashboardOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Admin";
  const { employees, isLoading: isLoadingEmployees, stats } = useEmployees();
  const requestsQuery = useCompanyServiceRequests();
  const requests = useMemo(() => requestsQuery.data ?? [], [requestsQuery.data]);
  const formattedToday = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );
  const currentYear = new Date().getFullYear();
  const activeRequestCount = requests.filter((request) => isOpenServiceRequest(request.status)).length;
  const completedRequestCount = requests.filter((request) => request.status === COMPLETED_STATUS).length;
  const overviewStats = [
    {
      label: "Active Requests",
      value: activeRequestCount.toLocaleString(),
      helper: "Service Requests currently active",
      icon: Zap,
    },
    {
      label: "Total Active Employees",
      value: stats.active.toLocaleString(),
      helper: "Ready for assignment",
      icon: UsersRound,
    },
    {
      label: "Pending Requests",
      value: requests.filter((request) => isAwaitingMechanic(request.status)).length.toLocaleString(),
      helper: "Awaiting a mechanic",
      icon: Clock3,
    },
    {
      label: "Completed Requests",
      value: completedRequestCount.toLocaleString(),
      helper: "Finished Service Requests",
      icon: CheckCircle2,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title={`Good morning, ${firstName}.`}
        description="Here's how the fleet is running today."
        actions={
          <>
            <span className="flex h-9 items-center gap-2 rounded-lg border border-[#eef0f3] bg-white px-4 text-xs font-extrabold text-[#4d5562] dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <CalendarDays className="size-4" />
              {formattedToday}
            </span>
            {["Today"].map((tab) => (
              <button
                key={tab}
                className={`h-9 rounded-lg px-5 text-xs font-extrabold ${
                  tab === "Today"
                    ? "bg-brand-red text-white shadow-lg"
                    : "bg-white text-[#596170] dark:bg-white/5 dark:text-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </>
        }
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            helper={stat.helper}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_440px]">
        <ActiveRequestsTable
          requests={requests}
          isLoading={requestsQuery.isLoading}
        />
        <EmployeesOnJobList
          employees={employees}
          isLoading={isLoadingEmployees}
        />
      </div>

      <footer className="mt-16 border-t border-[#eef0f3] py-6 text-xs text-[#6f7784] dark:border-white/10 dark:text-white/55">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span>&copy; {currentYear} Sherix Mechanic Portal</span>
          <nav className="flex gap-6">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>System Status</a>
          </nav>
          <span className="font-extrabold text-brand-dark dark:text-white md:ml-auto">
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </footer>
    </DashboardShell>
  );
}
