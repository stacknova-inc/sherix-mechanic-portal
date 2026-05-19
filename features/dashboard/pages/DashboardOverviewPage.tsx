import { CalendarDays } from "lucide-react";
import { ActiveJobsTable } from "@/features/dashboard/components/ActiveJobsTable";
import { ActiveRequestsList } from "@/features/dashboard/components/ActiveRequestsList";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { ServiceDistributionChart } from "@/features/dashboard/components/ServiceDistributionChart";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { overviewStats } from "@/features/dashboard/mocks/dashboard-mock-data";

export function DashboardOverviewPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Good morning, Grace."
        description="Here's how the fleet is running today."
        actions={
          <>
            <span className="flex h-9 items-center gap-2 rounded-lg border border-[#eef0f3] bg-white px-4 text-xs font-extrabold text-[#4d5562]">
              <CalendarDays className="size-4" />
              October 24, 2024
            </span>
            {["Today", "This Week", "This Month"].map((tab) => (
              <button
                key={tab}
                className={`h-9 rounded-lg px-5 text-xs font-extrabold ${
                  tab === "Today"
                    ? "bg-brand-red text-white shadow-lg"
                    : "bg-white text-[#596170]"
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
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="mt-12 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card">
          <div className="flex items-start justify-between border-b border-[#f0f2f5] pb-5">
            <div>
              <h3 className="text-lg font-extrabold">Daily Revenue Overview</h3>
              <p className="text-sm text-[#737b88]">Last 30 days</p>
            </div>
            <div className="flex rounded-lg border border-[#eef0f3] p-1 text-xs">
              <button className="h-7 px-4 text-[#6f7784]">Volume</button>
              <button className="h-7 rounded-lg bg-white px-4 shadow">Revenue</button>
            </div>
          </div>
          <RevenueChart />
        </section>

        <section className="rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card">
          <h3 className="text-lg font-extrabold">Service Distribution</h3>
          <p className="mt-1 text-sm text-[#737b88]">Revenue share by service</p>
          <ServiceDistributionChart />
        </section>
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_440px]">
        <ActiveJobsTable />
        <ActiveRequestsList />
      </div>

      <footer className="mt-16 border-t border-[#eef0f3] py-6 text-xs text-[#6f7784]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span>&copy; 2024 AutoFix Garage Operations Center</span>
          <nav className="flex gap-6">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>System Status</a>
          </nav>
          <span className="font-extrabold text-brand-dark md:ml-auto">
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </footer>
    </DashboardShell>
  );
}
