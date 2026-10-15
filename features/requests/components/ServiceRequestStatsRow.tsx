"use client";

import { BarChart3 } from "lucide-react";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { RequestStatsCard } from "@/features/requests/components/RequestStatsCard";
import { useCompanyServiceRequestStats } from "@/features/requests/hooks/useCompanyServiceRequests";
import type { ServiceRequestFilters } from "@/features/requests/types";

export function ServiceRequestStatsRow({ filters }: { filters: ServiceRequestFilters }) {
  const statsQuery = useCompanyServiceRequestStats(filters);

  if (statsQuery.isLoading) {
    return (
      <LoadingSkeleton
        label="Loading Service Request totals…"
        rows={4}
        rowClassName="h-32 rounded-xl"
        className="grid gap-4 space-y-0 sm:grid-cols-2 xl:grid-cols-4"
      />
    );
  }

  if (statsQuery.isError) {
    return (
      <QueryErrorState
        error={statsQuery.error}
        subject="Service Request totals"
        onRetry={() => void statsQuery.refetch()}
      />
    );
  }

  const stats = statsQuery.data ?? [];

  return (
    <section aria-label="Service Request totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <RequestStatsCard
          key={stat.key}
          title={stat.label}
          value={stat.value.toLocaleString()}
          helper="matching Service Requests"
          icon={BarChart3}
        />
      ))}
    </section>
  );
}
