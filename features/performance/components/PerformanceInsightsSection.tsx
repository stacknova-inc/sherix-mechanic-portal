"use client";

import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { PerformanceTrendCharts } from "@/features/performance/components/PerformanceTrendCharts";
import { usePerformanceInsights } from "@/features/performance/hooks/usePerformanceInsights";
import { cn } from "@/utils/cn";

interface PerformanceInsightsSectionProps {
  from: string;
  to: string;
  mechanicId: string;
  periodLabel: string;
  scopeDescription: string;
}

function MetricTile({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
      <p className="text-xs font-extrabold text-[#596170] dark:text-white/65">{title}</p>
      <p className="mt-3 text-xl font-bold tracking-tight text-brand-dark dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-[#8f96a3]">{helper}</p>
    </div>
  );
}

export function PerformanceInsightsSection({
  from,
  to,
  mechanicId,
  periodLabel,
  scopeDescription,
}: PerformanceInsightsSectionProps) {
  const query = usePerformanceInsights({ from, to, mechanicId });
  const insights = query.data;

  return (
    <SectionCard
      title="Quality & earnings"
      flush
    >
      {query.isLoading ? (
        <LoadingSkeleton label="Loading quality and earnings metrics…" rows={3} rowClassName="h-24" className="p-5" />
      ) : query.isError || !insights ? (
        <div className="p-5">
          <QueryErrorState error={query.error} subject="quality and earnings metrics" onRetry={() => void query.refetch()} />
        </div>
      ) : (
        <div className={cn(query.isPlaceholderData && "opacity-60")} aria-busy={query.isFetching}>
          

          <div className="border-t border-[#f0f2f5] p-5 dark:border-white/10">
            <PerformanceTrendCharts
              trend={insights.trend}
              currency={insights.currency}
              bucket={insights.bucket}
              periodLabel={periodLabel}
            />
          </div>

          
        </div>
      )}
    </SectionCard>
  );
}
