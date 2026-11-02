"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { fieldClassName } from "@/features/dashboard/components/form-styles";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { useDisputes } from "@/features/disputes/hooks/useDisputes";
import type { DisputeStatus, DisputeSummary } from "@/features/disputes/types";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { formatDate } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 8;
const TABS: Array<{ value: DisputeStatus | ""; label: string; countKey: "all" | DisputeStatus }> = [
  { value: "", label: "All", countKey: "all" },
  { value: "open", label: "Open", countKey: "open" },
  { value: "under_review", label: "Under review", countKey: "under_review" },
  { value: "resolved", label: "Resolved", countKey: "resolved" },
];

function disputeHref(dispute: DisputeSummary) {
  return `/disputes/${encodeURIComponent(dispute.id)}`;
}

function DueLabel({ dispute }: { dispute: DisputeSummary }) {
  if (!dispute.responseDueAt) {
    return null;
  }

  const overdue = new Date(dispute.responseDueAt).getTime() < Date.now();
  return (
    <span className={cn("block text-xs font-extrabold", overdue ? "text-brand-red" : "text-[#9a6a00]")}>
      {overdue ? "Response overdue" : `Respond by ${formatDate(dispute.responseDueAt)}`}
    </span>
  );
}

export function DisputesListPage() {
  const [status, setStatus] = useState<DisputeStatus | "">("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDisputes({ status, search, page, limit: PAGE_SIZE });
  const disputes = query.data?.data ?? [];
  const counts = query.data?.counts;
  const pagination = query.data?.pagination;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchDraft);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

  return (
    <DashboardShell>
      <PageHeader
        title="Disputes"
        description="Disputes raised on Service Requests assigned to your company."
        actions={<SampleDataBadge />}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div role="group" aria-label="Filter disputes by status" className="flex flex-wrap gap-1 rounded-xl border border-[#eef0f3] bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
          {TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                  active
                    ? "bg-brand-dark text-white dark:bg-white dark:text-brand-dark"
                    : "text-[#6f7784] hover:bg-[#f7f8fa] dark:text-white/60 dark:hover:bg-white/10",
                )}
              >
                {tab.label}
                {counts ? (
                  <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-white/15" : "bg-[#f4f5f7] dark:bg-white/10")}>
                    {counts[tab.countKey]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="w-full lg:ml-auto lg:w-80">
          <label htmlFor="dispute-search" className="sr-only">Search disputes</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]" aria-hidden="true" />
            <input
              id="dispute-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by dispute, Service Request, customer"
              className={`${fieldClassName} pl-10`}
            />
          </div>
        </div>
      </div>

      <section
        aria-label="Dispute list"
        className="rounded-xl border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
      >
        {query.isLoading ? (
          <LoadingSkeleton label="Loading disputes…" rows={6} className="p-5" />
        ) : query.isError ? (
          <div className="p-5">
            <QueryErrorState error={query.error} subject="disputes" onRetry={() => void query.refetch()} />
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={search || status ? "No disputes match" : "No disputes"}
              description={
                search || status
                  ? "Try another status or search term."
                  : "Disputes raised on your company's Service Requests will appear here."
              }
            />
          </div>
        ) : (
          <div className={cn(query.isPlaceholderData && "opacity-60")} aria-busy={query.isFetching}>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Disputes</caption>
                <thead>
                  <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
                    <th scope="col" className="px-5 py-4">Dispute</th>
                    <th scope="col" className="px-3 py-4">Service Request</th>
                    <th scope="col" className="px-3 py-4">Customer</th>
                    <th scope="col" className="px-3 py-4">Mechanic</th>
                    <th scope="col" className="px-3 py-4">Status</th>
                    <th scope="col" className="px-3 py-4 text-right">In dispute</th>
                    <th scope="col" className="px-5 py-4">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute.id} className="border-t border-[#f3f5f7] transition hover:bg-[#fbfcfd] dark:border-white/10 dark:hover:bg-white/[0.03]">
                      <th scope="row" className="px-5 py-3 text-left">
                        <Link
                          href={disputeHref(dispute)}
                          className="rounded font-extrabold text-brand-dark underline-offset-4 hover:text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white"
                        >
                          {dispute.reference}
                        </Link>
                        <span className="block text-xs font-semibold text-[#8f96a3]">{dispute.category}</span>
                      </th>
                      <td className="px-3 py-3">
                        <span className="block font-semibold">{dispute.serviceRequest.reference}</span>
                        <span className="block text-xs text-[#8f96a3]">{dispute.serviceRequest.serviceName}</span>
                      </td>
                      <td className="px-3 py-3 text-[#596170] dark:text-white/65">{dispute.customerName}</td>
                      <td className="px-3 py-3 text-[#596170] dark:text-white/65">{dispute.mechanic.name}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={dispute.status} />
                        <DueLabel dispute={dispute} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                        {formatMoney(dispute.amountInDispute, dispute.currency)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[#596170] dark:text-white/65">{formatDate(dispute.openedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 p-4 lg:hidden">
              {disputes.map((dispute) => (
                <li key={dispute.id} className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={disputeHref(dispute)} className="rounded font-extrabold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white">
                        {dispute.reference}
                      </Link>
                      <p className="text-xs text-[#8f96a3]">{dispute.category}</p>
                    </div>
                    <StatusBadge status={dispute.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="font-extrabold text-[#8f96a3]">Service Request</dt><dd className="mt-1">{dispute.serviceRequest.reference}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">In dispute</dt><dd className="mt-1">{formatMoney(dispute.amountInDispute, dispute.currency)}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Customer</dt><dd className="mt-1">{dispute.customerName}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Mechanic</dt><dd className="mt-1">{dispute.mechanic.name}</dd></div>
                  </dl>
                  <div className="mt-2"><DueLabel dispute={dispute} /></div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && pagination.total > 0 && !query.isError ? (
          <PaginationControls
            label="Dispute pages"
            page={pagination.page}
            totalPages={pagination.pages}
            onPageChange={setPage}
            disabled={query.isPlaceholderData}
            summary={`${pagination.total.toLocaleString()} disputes`}
          />
        ) : null}
      </section>
    </DashboardShell>
  );
}
