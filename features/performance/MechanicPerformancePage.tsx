"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { MechanicPerformanceTable } from "@/features/performance/components/MechanicPerformanceTable";
import { PerformanceInsightsSection } from "@/features/performance/components/PerformanceInsightsSection";
import {
  PERFORMANCE_PERIODS,
  buildMechanicPerformance,
  buildPerformanceDrillDownHref,
  formatRate,
  getPeriodLabel,
  getPeriodRange,
  parsePerformancePeriod,
  type PerformanceScope,
} from "@/features/performance/utils/mechanic-performance";
import { useCompanyServiceRequests } from "@/features/requests/hooks/useCompanyServiceRequests";
import {
  getDistinctOptions,
  getMechanicKey,
  getMechanicLabel,
} from "@/features/requests/utils/service-request-filters";
import {
  CANCELLED_STATUS,
  COMPLETED_STATUS,
} from "@/features/requests/utils/service-request-status";

const fieldClassName =
  "h-10 w-full rounded-xl border border-[#eef0f3] bg-white px-3 text-sm font-semibold text-brand-dark outline-none transition focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-[#1b1d22] dark:text-white";

function SummaryTile({
  title,
  value,
  href,
  linkLabel,
}: {
  title: string;
  value: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <h2 className="text-sm font-extrabold text-brand-dark dark:text-white">{title}</h2>
      <p className="mt-6 text-2xl font-bold tracking-tight text-brand-dark dark:text-white">{value}</p>
      {href ? (
        <Link
          href={href}
          className="mt-3 inline-block rounded text-xs font-extrabold text-brand-red underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
        >
          {linkLabel}
        </Link>
      ) : null}
    </section>
  );
}

export function MechanicPerformancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = parsePerformancePeriod(searchParams.get("period"));
  const mechanic = searchParams.get("mechanic")?.trim() ?? "";
  const periodLabel = getPeriodLabel(period);
  const requestsQuery = useCompanyServiceRequests();
  const requests = requestsQuery.data;

  const scope = useMemo<PerformanceScope>(
    () => ({ ...getPeriodRange(period), mechanic }),
    [period, mechanic],
  );
  const summary = useMemo(
    () => (requests ? buildMechanicPerformance(requests, scope) : null),
    [requests, scope],
  );
  const mechanicOptions = useMemo(
    () =>
      requests
        ? getDistinctOptions(requests, getMechanicKey, getMechanicLabel)
        : [],
    [requests],
  );
  const selectedMechanicName = mechanicOptions.find((option) => option.value === mechanic)?.label;
  const scopeDescription = `${periodLabel} · ${selectedMechanicName ?? "All mechanics"}`;

  function updateParams(next: { period?: string; mechanic?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Mechanic Performance"
        description="Service Request outcomes for mechanics assigned to your company."
      />

      <fieldset className="mb-8 grid gap-3 sm:grid-cols-2 lg:max-w-[640px]">
        <legend className="sr-only">Performance filters</legend>
        <div>
          <label htmlFor="performance-period" className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#8a929e]">
            Period
          </label>
          <select
            id="performance-period"
            value={period}
            onChange={(event) => updateParams({ period: event.target.value })}
            className={fieldClassName}
          >
            {PERFORMANCE_PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="performance-mechanic" className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#8a929e]">
            Mechanic
          </label>
          <select
            id="performance-mechanic"
            value={mechanic}
            onChange={(event) => updateParams({ mechanic: event.target.value })}
            className={fieldClassName}
          >
            <option value="">All mechanics</option>
            {mechanicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {requestsQuery.isLoading ? (
        <div role="status" className="grid gap-4 md:grid-cols-3">
          <span className="sr-only">Loading mechanic performance…</span>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} aria-hidden="true" className="h-36 animate-pulse rounded-xl bg-[#f1f3f6] dark:bg-white/10" />
          ))}
        </div>
      ) : requestsQuery.isError ? (
        <QueryErrorState
          error={requestsQuery.error}
          subject="mechanic performance"
          onRetry={() => void requestsQuery.refetch()}
        />
      ) : summary ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3" aria-label={`Totals, ${scopeDescription}`}>
            <SummaryTile
              title={`Completed Service Requests — ${periodLabel}`}
              value={summary.totals.completed.toLocaleString()}
              href={buildPerformanceDrillDownHref(scope, COMPLETED_STATUS)}
              linkLabel="View completed Service Requests"
            />
            <SummaryTile
              title={`Cancelled Service Requests — ${periodLabel}`}
              value={summary.totals.cancelled.toLocaleString()}
              href={buildPerformanceDrillDownHref(scope, CANCELLED_STATUS)}
              linkLabel="View cancelled Service Requests"
            />
            
          </div>

          <section
            aria-labelledby="mechanic-breakdown-heading"
            className="rounded-xl border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
          >
            <div className="border-b border-[#f0f2f5] px-5 py-4 dark:border-white/10">
              <h2 id="mechanic-breakdown-heading" className="text-lg font-extrabold text-brand-dark dark:text-white">
                Service Request outcomes by mechanic
              </h2>
              <p className="text-xs font-semibold text-[#8f96a3]">{scopeDescription}</p>
            </div>
            {summary.rows.length ? (
              <MechanicPerformanceTable rows={summary.rows} scope={scope} periodLabel={periodLabel} />
            ) : (
              <div className="p-5">
                <EmptyState
                  title="No assigned Service Requests in this period"
                  description="Choose a longer period or a different mechanic to see performance."
                />
              </div>
            )}
            {summary.unassigned > 0 ? (
              <p className="border-t border-[#f0f2f5] px-5 py-3 text-xs font-semibold text-[#6f7784] dark:border-white/10">
                {summary.unassigned.toLocaleString()} Service Request{summary.unassigned === 1 ? "" : "s"} in this
                period {summary.unassigned === 1 ? "has" : "have"} no assigned mechanic and{" "}
                {summary.unassigned === 1 ? "is" : "are"} counted in the totals only.
              </p>
            ) : null}
          </section>

         
        </div>
      ) : null}

      {/* Independent of the Service Request query so one failing does not hide the other. */}
      <div className="mt-8">
        <PerformanceInsightsSection
          from={scope.from}
          to={scope.to}
          mechanicId={mechanic}
          periodLabel={periodLabel}
          scopeDescription={scopeDescription}
        />
      </div>
    </DashboardShell>
  );
}
