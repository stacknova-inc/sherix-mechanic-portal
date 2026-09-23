"use client";

import { Card } from "@/components/ui/card";
import {
  Wallet,
  WalletCards,
  DollarSign,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { EarningsStatCard } from "../components/EarningsStatCard";

export default function EarningsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Earnings"
        description="Track your total revenue, payouts, and earnings performance across all providers."
        actions={null}
        
      />

      <div className="space-y-4 ">
   
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <EarningsStatCard
            title="Total Earnings"
            value="GHS 12,450"
            trend="+18.6%"
            
            icon={Wallet}
            tone="positive"
          />
         
         
          <EarningsStatCard
            title="Total Earned Today"
            value="48"
            trend="+14.3%"
          
            icon={CheckCircle2}
            tone="positive"
          />
          <EarningsStatCard
            title="Total Payout Left"
            value="1000"
            trend="+14.3%"
          
            icon={CheckCircle2}
            tone="positive"
          />
        </div>

        {/* ===================== CHART SECTION ===================== */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Earnings Chart */}
          <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Earnings Overview</h2>

              <select className="rounded-lg border px-3 py-1 text-sm">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="h-[280px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
              {/* Replace with your EarningsAreaChart */}
              Earnings Area Chart Here
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold">Earnings Breakdown</h2>

            <div className="h-[220px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
              {/* Replace with DonutChart */}
              Donut Chart Here
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <BreakdownItem
                label="Service Earnings"
                value="65%"
                color="bg-green-500"
              />
              <BreakdownItem
                label="Parts Earnings"
                value="25%"
                color="bg-blue-500"
              />
              <BreakdownItem label="Tips" value="10%" color="bg-orange-500" />
            </div>
          </div>
        </div>

        </div>
    </DashboardShell>
  );
}

/* ===================== SUB COMPONENTS ===================== */

function MetricCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: "green" | "blue" | "orange" | "yellow" | "emerald";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    yellow: "bg-yellow-50 text-yellow-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-green-600">{trend}</p>
        </div>

        <div className={`rounded-xl p-2 ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}

function BreakdownItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
