"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, UsersRound, Zap } from "lucide-react";
import { ActiveRequestsTable } from "@/features/dashboard/components/ActiveRequestsTable";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useEmployees } from "@/features/dashboard/hooks/useEmployees";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { EmployeesOnJobList } from "../components/EmployeesOnJobList";
import { getAdminBookings } from "@/features/requests/services/bookings-service";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export function DashboardOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const canFetchDashboard = hasHydrated && Boolean(token && isCompanyAdmin(user));
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Admin";
  const { employees, isLoading: isLoadingEmployees, stats } = useEmployees();
  const bookingsQuery = useQuery({
    queryKey: ["company-admin-bookings"],
    queryFn: getAdminBookings,
    enabled: canFetchDashboard,
  });
  const bookings = bookingsQuery.data ?? [];
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
  const activeRequestCount = bookings.filter((booking) =>
    ["Pending", "In Review", "Approved"].includes(booking.status),
  ).length;
  const completedRequestCount = bookings.filter(
    (booking) => booking.status === "Completed",
  ).length;
  const overviewStats = [
    {
      label: "Active Requests",
      value: activeRequestCount.toLocaleString(),
      helper: "Jobs currently live",
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
      value: bookings
        .filter((booking) => booking.status === "Pending")
        .length.toLocaleString(),
      helper: "Awaiting action",
      icon: Clock3,
    },
    {
      label: "Completed Requests",
      value: completedRequestCount.toLocaleString(),
      helper: "Finished bookings",
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
          requests={bookings}
          isLoading={bookingsQuery.isLoading}
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
