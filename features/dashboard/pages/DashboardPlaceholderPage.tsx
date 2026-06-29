import { Bell, BarChart3, Settings, WalletCards, Zap } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";

const pageCopy = {
  requests: {
    title: "Requests",
    description: "Review incoming jobs, assignments, and service progress.",
    icon: Zap,
  },
  analytics: {
    title: "Analytics",
    description: "Track operational performance, revenue, and fleet utilization.",
    icon: BarChart3,
  },
  earnings: {
    title: "Earnings & Payouts",
    description: "Monitor payouts, daily revenue, and settlement status.",
    icon: WalletCards,
  },
  notifications: {
    title: "Notifications",
    description: "Manage alerts, system events, and mechanic updates.",
    icon: Bell,
  },
  settings: {
    title: "Settings",
    description: "Configure dashboard preferences and operational defaults.",
    icon: Settings,
  },
};

type PlaceholderPageKey = keyof typeof pageCopy;

interface DashboardPlaceholderPageProps {
  page: PlaceholderPageKey;
}

export function DashboardPlaceholderPage({ page }: DashboardPlaceholderPageProps) {
  const copy = pageCopy[page];
  const Icon = copy.icon;

  return (
    <DashboardShell>
      <PageHeader title={copy.title} description={copy.description} />
      <div className="mt-8">
        <EmptyState
          title={`${copy.title} workspace is ready`}
          description="This frontend surface is intentionally prepared with layout, routing, and structure for backend integration."
        />
      </div>
      <div className="mt-6 rounded-lg border border-[#eef0f3] bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
        <Icon className="size-8 text-brand-red" />
        <p className="mt-4 text-sm font-medium text-[#6f7784] dark:text-white/55">
          Add data services, hooks, and page-specific components inside the dashboard
          feature without changing the shared layout.
        </p>
      </div>
    </DashboardShell>
  );
}
