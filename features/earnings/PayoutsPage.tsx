"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { secondaryButtonClassName } from "@/features/dashboard/components/form-styles";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { EarningsSummaryCards } from "@/features/earnings/components/EarningsSummaryCards";
import { PayoutHistory } from "@/features/earnings/components/PayoutHistory";
import { useEarningsSummary } from "@/features/earnings/hooks/useEarnings";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";
import {
  DEFAULT_REPORTING_PERIOD,
  REPORTING_PERIODS,
  getPeriodLabel,
  getPeriodRange,
  type ReportingPeriod,
} from "@/lib/periods";

export function PayoutsPage() {
  const role = useUserRole();
  const [period, setPeriod] = useState<ReportingPeriod>(DEFAULT_REPORTING_PERIOD);
  const range = useMemo(() => getPeriodRange(period), [period]);
  const summaryQuery = useEarningsSummary(range);

  return (
    <DashboardShell>
      <PageHeader
        title="Payouts"
        description="Review payout totals, processing status, and payment history for your mechanics."
        actions={
          <>
            <SampleDataBadge />
            <label htmlFor="payout-summary-period" className="sr-only">Summary period</label>
            <select
              id="payout-summary-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value as ReportingPeriod)}
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#1b1d22]"
            >
              {REPORTING_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
        <EarningsSummaryCards
          summary={summaryQuery.data}
          periodLabel={getPeriodLabel(period)}
          isLoading={summaryQuery.isLoading}
          error={summaryQuery.isError ? summaryQuery.error : null}
          onRetry={() => void summaryQuery.refetch()}
        />
        <PayoutHistory />
      </div>
    </DashboardShell>
  );
}
