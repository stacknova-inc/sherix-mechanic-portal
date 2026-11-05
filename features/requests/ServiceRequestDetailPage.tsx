"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { ServiceRequestExtrasSection } from "@/features/requests/components/ServiceRequestExtrasSection";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { useCompanyServiceRequests } from "@/features/requests/hooks/useCompanyServiceRequests";
import type { CompanyServiceRequest } from "@/features/requests/types";
import {
  buildServiceRequestHistoryHref,
  getMechanicKey,
  getMechanicLabel,
} from "@/features/requests/utils/service-request-filters";
import { formatDate, formatDateTime } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

const notAvailable = "Not available";

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
    >
      <h2 className="text-base font-extrabold text-brand-dark dark:text-white">{title}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase text-[#8a929e]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#343a45] dark:text-white/80">
        {children}
      </dd>
    </div>
  );
}

function ServiceRequestDetails({ request }: { request: CompanyServiceRequest }) {
  const mechanicKey = getMechanicKey(request);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DetailSection title="Overview">
        <DetailItem label="Service Request ID">{request.reference}</DetailItem>
        <DetailItem label="Status">
          <StatusBadge status={request.status} />
        </DetailItem>
        <DetailItem label="Service">{request.serviceName ?? notAvailable}</DetailItem>
        <DetailItem label="Location">{request.location ?? notAvailable}</DetailItem>
        <DetailItem label="Service date">{formatDate(request.date)}</DetailItem>
        <DetailItem label="Created">{formatDateTime(request.createdAt)}</DetailItem>
        <DetailItem label="Last updated">{formatDateTime(request.updatedAt)}</DetailItem>
      </DetailSection>

      <DetailSection title="Parties">
        <DetailItem label="Customer">{request.customerName ?? notAvailable}</DetailItem>
        <DetailItem label="Assigned mechanic">
          {request.mechanicId ? (
            <Link
              href={`/employee/${encodeURIComponent(request.mechanicId)}`}
              className="rounded text-brand-red underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              {getMechanicLabel(request)}
            </Link>
          ) : (
            getMechanicLabel(request)
          )}
        </DetailItem>
        {mechanicKey ? (
          <div className="sm:col-span-2">
            <Link
              href={buildServiceRequestHistoryHref({ mechanic: mechanicKey })}
              className="rounded text-sm font-extrabold text-brand-red underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              View all Service Requests for this mechanic
            </Link>
          </div>
        ) : null}
      </DetailSection>

      <DetailSection title="Payment">
        <DetailItem label="Payment status">
          <StatusBadge status={request.paymentStatus} />
        </DetailItem>
        <DetailItem label="Service Request amount">
          {formatMoney(request.amount, request.currency)}
        </DetailItem>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-[#8f96a3]">
            Fees, commission, payout split, and payout status are not part of this record yet; the
            &ldquo;Earnings breakdown&rdquo; below shows sample data until the backend provides them.
          </p>
        </div>
      </DetailSection>
    </div>
  );
}

export function ServiceRequestDetailPage({ requestId }: { requestId: string }) {
  const requestsQuery = useCompanyServiceRequests();
  const request = requestsQuery.data?.find(
    (item) => item.id === requestId || item.reference === requestId,
  );

  return (
    <DashboardShell>
      <Link
        href="/requests"
        className="mb-6 inline-flex items-center gap-2 rounded text-sm font-extrabold text-[#6f7784] transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white/60"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Service Requests
      </Link>

      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white md:text-[34px]">
        Service Request {request ? request.reference : ""}
      </h1>

      {requestsQuery.isLoading ? (
        <div role="status" className="grid gap-5 xl:grid-cols-2">
          <span className="sr-only">Loading Service Request…</span>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-48 animate-pulse rounded-xl bg-[#f1f3f6] dark:bg-white/10"
            />
          ))}
        </div>
      ) : requestsQuery.isError ? (
        <QueryErrorState
          error={requestsQuery.error}
          subject="this Service Request"
          onRetry={() => void requestsQuery.refetch()}
        />
      ) : request ? (
        <>
          <ServiceRequestDetails request={request} />
          <ServiceRequestExtrasSection request={request} />
        </>
      ) : (
        <EmptyState
          title="Service Request not found"
          description="It may not exist, or it is not assigned to your company."
        />
      )}
    </DashboardShell>
  );
}
