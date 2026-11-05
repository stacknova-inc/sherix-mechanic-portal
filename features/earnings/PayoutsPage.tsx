"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { secondaryButtonClassName } from "@/features/dashboard/components/form-styles";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { FinancialRangeFilter, type FinancialRange } from "@/features/earnings/components/FinancialRangeFilter";
import { FinancialStatsCards } from "@/features/earnings/components/FinancialStatsCards";
import { PayoutHistory } from "@/features/earnings/components/PayoutHistory";
import { usePayoutStatistics } from "@/features/earnings/hooks/useEarnings";
import type { FinancialStatsParams } from "@/features/earnings/types";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";

export function PayoutsPage() {
  const role = useUserRole();
  const [range, setRange] = useState<FinancialRange>("90D");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const period = useMemo<FinancialStatsParams | null>(() => {
    if (range === "custom") return fromDate && toDate ? { fromDate, toDate } : null;
    return { range };
  }, [range, fromDate, toDate]);
  const statsQuery = usePayoutStatistics(period);

  return (
    <DashboardShell>
      <PageHeader
        title="Payouts"
        description="Review payout statistics and company payout records."
        actions={
          <>
            {hasPermission(role, "configurePayouts") ? (
              <Link href="/earnings/payout-settings" className={secondaryButtonClassName}>
                <Settings2 className="size-4" aria-hidden="true" />
                Payout settings
              </Link>
            ) : null}
          </>
        }
      />
      <div className="space-y-6">
        <FinancialRangeFilter
          idPrefix="payout-stats"
          range={range}
          fromDate={fromDate}
          toDate={toDate}
          onRangeChange={setRange}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        {range === "custom" && !period ? (
          <p role="status" className="text-sm font-semibold text-[#6f7784]">Choose both dates to load payout statistics.</p>
        ) : (
          <FinancialStatsCards
            title="Payout statistics"
            periodLabel={statsQuery.data?.period.label}
            stats={statsQuery.data ? [
              { title: "Total payouts", stat: statsQuery.data.totalPayouts },
              { title: "Pending payouts", stat: statsQuery.data.pendingPayouts },
              { title: "Successful payouts", stat: statsQuery.data.successfulPayouts },
              { title: "Failed payouts", stat: statsQuery.data.failedPayouts },
            ] : undefined}
            isLoading={statsQuery.isLoading}
            error={statsQuery.isError ? statsQuery.error : null}
            onRetry={() => void statsQuery.refetch()}
          />
        )}
        <PayoutHistory />
      </div>
    </DashboardShell>
  );
}
