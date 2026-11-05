"use client";

import Link from "next/link";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { textLinkClassName } from "@/features/dashboard/components/form-styles";
import { CommissionBreakdown } from "@/features/earnings/components/CommissionBreakdown";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { useServiceRequestExtras } from "@/features/requests/hooks/useServiceRequestExtras";
import type { CompanyServiceRequest } from "@/features/requests/types";
import { formatDateTime } from "@/lib/date-format";

export function ServiceRequestExtrasSection({ request }: { request: CompanyServiceRequest }) {
  const query = useServiceRequestExtras(request);
  const extras = query.data;

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <SectionCard title="Timeline" badge={<SampleDataBadge />}>
        {query.isLoading ? (
          <LoadingSkeleton label="Loading timeline…" rows={4} rowClassName="h-10" />
        ) : query.isError || !extras ? (
          <QueryErrorState error={query.error} subject="the timeline" onRetry={() => void query.refetch()} />
        ) : (
          <ol className="relative space-y-4 border-l border-[#e5e8ee] pl-5 dark:border-white/10">
            {extras.timeline.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand-red ring-4 ring-white dark:ring-[#1b1d22]" aria-hidden="true" />
                <p className="text-sm font-extrabold text-brand-dark dark:text-white">{event.label}</p>
                <p className="text-xs font-semibold text-[#8f96a3]">
                  <time dateTime={event.at}>{formatDateTime(event.at)}</time> · {event.actor}
                </p>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <SectionCard title="Earnings breakdown" badge={<SampleDataBadge />}>
        {query.isLoading ? (
          <LoadingSkeleton label="Loading earnings breakdown…" rows={4} rowClassName="h-8" />
        ) : query.isError || !extras ? (
          <QueryErrorState error={query.error} subject="the earnings breakdown" onRetry={() => void query.refetch()} />
        ) : extras.financials ? (
          <div className="space-y-4">
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6f7784] dark:text-white/55">
              Transaction {extras.financials.transactionReference} · Mechanic payout
              <StatusBadge status={extras.financials.payoutStatus} />
            </p>
            <CommissionBreakdown breakdown={extras.financials.breakdown} currency={extras.financials.currency} />
            {extras.dispute ? (
              <p className="text-sm font-semibold text-[#9a6a00]">
                This Service Request has a dispute ({extras.dispute.status.replace("_", " ")}).{" "}
                <Link href={`/disputes/${encodeURIComponent(extras.dispute.id)}`} className={textLinkClassName}>
                  View dispute
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[#6f7784] dark:text-white/55">
            Earnings are recorded once the Service Request is completed and paid.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
