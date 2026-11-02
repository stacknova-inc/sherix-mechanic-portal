"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRightLeft, Settings2, Wallet } from "lucide-react";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { fieldClassName, secondaryButtonClassName } from "@/features/dashboard/components/form-styles";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { TransactionsSection } from "@/features/earnings/components/TransactionsSection";
import { useEarningsSummary } from "@/features/earnings/hooks/useEarnings";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";
import { formatMoney } from "@/lib/money";
import {
  DEFAULT_REPORTING_PERIOD,
  REPORTING_PERIODS,
  getPeriodLabel,
  getPeriodRange,
  type ReportingPeriod,
} from "@/lib/periods";

export function EarningsPage() {
  const role = useUserRole();
  const [period, setPeriod] = useState<ReportingPeriod>(DEFAULT_REPORTING_PERIOD);
  const range = useMemo(() => getPeriodRange(period), [period]);
  const summaryQuery = useEarningsSummary(range);

  return (
    <DashboardShell>
      <PageHeader
        title="Earnings & Transactions"
        description="Track company earnings, customer payments, and transaction settlement details."
        actions={
          <>
            <SampleDataBadge />
            <label htmlFor="earnings-period" className="sr-only">Summary period</label>
            <select
              id="earnings-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value as ReportingPeriod)}
              className={`${fieldClassName} w-auto`}
            >
              {REPORTING_PERIODS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {hasPermission(role, "configurePayouts") ? (
              <Link href="/earnings/payout-settings" className={secondaryButtonClassName}>
                <Settings2 className="size-4" aria-hidden="true" />
                Payout settings
              </Link>
            ) : null}
          </>
        }
      />

      <div className="space-y-8">
        {summaryQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-36 animate-pulse rounded-xl bg-white dark:bg-white/5" />
            <div className="h-36 animate-pulse rounded-xl bg-white dark:bg-white/5" />
          </div>
        ) : summaryQuery.isError || !summaryQuery.data ? (
          <div className="rounded-xl border border-[#eef0f3] bg-white p-5 dark:border-white/10 dark:bg-[#1b1d22]">
            <p className="font-bold">Earnings summary unavailable</p>
            <button type="button" onClick={() => void summaryQuery.refetch()} className="mt-2 text-sm font-bold text-brand-red">Try again</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" aria-label={`Earnings summary, ${getPeriodLabel(period)}`}>
            <SummaryCard title={`Total earnings — ${getPeriodLabel(period)}`} value={formatMoney(summaryQuery.data.totalEarnings, summaryQuery.data.currency)} helper="Company share of completed transactions" icon={Wallet} />
            <SummaryCard title="Outstanding balance" value={formatMoney(summaryQuery.data.outstandingBalance, summaryQuery.data.currency)} helper="Company share not yet settled" icon={ArrowRightLeft} />
          </div>
        )}
        <TransactionsSection />
      </div>
    </DashboardShell>
  );
}

function SummaryCard({ title, value, helper, icon: Icon }: { title: string; value: string; helper: string; icon: LucideIcon }) {
  return (
    <section className="rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-brand-dark dark:text-white">{title}</h2>
        <span className="flex size-8 items-center justify-center rounded-lg border border-[#eef0f3] text-[#8f96a3] dark:border-white/10"><Icon className="size-4" aria-hidden="true" /></span>
      </div>
      <p className="mt-6 text-2xl font-bold tracking-tight text-brand-dark dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#7a828f] dark:text-white/50">{helper}</p>
    </section>
  );
}
