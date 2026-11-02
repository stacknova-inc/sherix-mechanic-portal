"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, MoreVertical, UserRoundCog } from "lucide-react";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import type { CompanyServiceRequest } from "@/features/requests/types";
import { getMechanicLabel, getServiceRequestHref } from "@/features/requests/utils/service-request-filters";
import { formatDate } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

interface RequestsTableProps {
  requests: CompanyServiceRequest[];
  isLoading: boolean;
  error: unknown;
  hasAnyRequests: boolean;
  hasActiveFilters: boolean;
  page: number;
  totalPages: number;
  totalMatching: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  onReassign: (request: CompanyServiceRequest) => void;
}

const columns = [
  "Service Request",
  "Customer",
  "Mechanic",
  "Service",
  "Date",
  "Status",
  "Payment",
  "Amount",
  "Actions",
];

const notAvailable = "Not available";

function RequestActionsMenu({
  request,
  isOpen,
  onToggle,
  onClose,
  onReassign,
}: {
  request: CompanyServiceRequest;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReassign: (request: CompanyServiceRequest) => void;
}) {
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for Service Request ${request.reference}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="rounded-md p-2 text-[#596170] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white/70 dark:hover:bg-white/10"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          role="menu"
          aria-label={`Service Request ${request.reference} actions`}
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[#eef0f3] bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#202329]"
        >
          <Link
            href={getServiceRequestHref(request)}
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#343a45] hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
          >
            <Eye className="size-4" aria-hidden="true" />
            View Service Request
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onReassign(request);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#343a45] hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
          >
            <UserRoundCog className="size-4" aria-hidden="true" />
            Reassign
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ReferenceLink({ request }: { request: CompanyServiceRequest }) {
  return (
    <Link
      href={getServiceRequestHref(request)}
      aria-label={`Open Service Request ${request.reference}`}
      className="rounded font-extrabold text-brand-dark underline-offset-4 hover:text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white"
    >
      {request.reference}
    </Link>
  );
}

function EmptyResults({
  hasAnyRequests,
  hasActiveFilters,
  onClearFilters,
}: Pick<RequestsTableProps, "hasAnyRequests" | "hasActiveFilters" | "onClearFilters">) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-base font-extrabold text-brand-dark dark:text-white">
        {hasAnyRequests ? "No Service Requests match these filters" : "No Service Requests yet"}
      </p>
      <p className="mt-1 text-sm text-[#8f96a3]">
        {hasAnyRequests
          ? "Try a different search term, status, mechanic, or date range."
          : "Service Requests assigned to your company will appear here."}
      </p>
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 h-9 rounded-lg border border-[#eef0f3] px-4 text-xs font-extrabold text-[#4b535f] transition hover:border-brand-red hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:border-white/10 dark:text-white/80"
        >
          Clear search and filters
        </button>
      ) : null}
    </div>
  );
}

export function RequestsTable({
  requests,
  isLoading,
  error,
  hasAnyRequests,
  hasActiveFilters,
  page,
  totalPages,
  totalMatching,
  onPageChange,
  onRetry,
  onClearFilters,
  onReassign,
}: RequestsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const showEmpty = !isLoading && !error && requests.length === 0;

  return (
    <section
      aria-labelledby="service-request-history-heading"
      aria-busy={isLoading}
      className="rounded-xl border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
    >
      <div className="border-b border-[#f0f2f5] px-5 py-4 dark:border-white/10">
        <h2
          id="service-request-history-heading"
          className="text-lg font-extrabold text-brand-dark dark:text-white"
        >
          Service Request history
        </h2>
        <p className="text-xs font-semibold text-[#8f96a3]">
          Amounts are the Service Request amount recorded by the backend, not company earnings.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5" role="status">
          <span className="sr-only">Loading Service Requests…</span>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-[#f1f3f6] dark:bg-white/10"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="p-5">
          <QueryErrorState error={error} subject="Service Requests" onRetry={onRetry} />
        </div>
      ) : null}

      {showEmpty ? (
        <EmptyResults
          hasAnyRequests={hasAnyRequests}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      ) : null}

      {!isLoading && !error && requests.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Service Requests, page {page} of {totalPages}
              </caption>
              <thead>
                <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
                  {columns.map((column) => (
                    <th key={column} scope="col" className="px-5 py-4">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[#f3f5f7] transition hover:bg-[#fbfcfd] dark:border-white/10 dark:hover:bg-white/[0.03]"
                  >
                    <th scope="row" className="px-5 py-4 font-semibold">
                      <ReferenceLink request={request} />
                    </th>
                    <td className="px-5 py-4 text-[#343a45] dark:text-white/80">
                      {request.customerName ?? notAvailable}
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {getMechanicLabel(request)}
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {request.serviceName ?? notAvailable}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#596170] dark:text-white/65">
                      {formatDate(request.date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.paymentStatus} srLabel="Payment status" />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#343a45] dark:text-white/80">
                      {formatMoney(request.amount, request.currency)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <RequestActionsMenu
                        request={request}
                        isOpen={openMenuId === request.id}
                        onToggle={() => setOpenMenuId((current) => current === request.id ? null : request.id)}
                        onClose={() => setOpenMenuId(null)}
                        onReassign={onReassign}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 p-4 lg:hidden">
            {requests.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-[#eef0f3] bg-white p-4 shadow-card dark:border-white/10 dark:bg-white/[0.03]"
              >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ReferenceLink request={request} />
                  <StatusBadge status={request.status} />
                </div>
                <RequestActionsMenu
                  request={request}
                  isOpen={openMenuId === request.id}
                  onToggle={() => setOpenMenuId((current) => current === request.id ? null : request.id)}
                  onClose={() => setOpenMenuId(null)}
                  onReassign={onReassign}
                />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Customer", request.customerName ?? notAvailable],
                    ["Mechanic", getMechanicLabel(request)],
                    ["Service", request.serviceName ?? notAvailable],
                    ["Date", formatDate(request.date)],
                    ["Amount", formatMoney(request.amount, request.currency)],
                  ].map(([term, value]) => (
                    <div key={term}>
                      <dt className="font-extrabold text-[#8f96a3]">{term}</dt>
                      <dd className="mt-1 break-words text-[#343a45] dark:text-white/75">{value}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="font-extrabold text-[#8f96a3]">Payment</dt>
                    <dd className="mt-1">
                      <StatusBadge status={request.paymentStatus} />
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {!isLoading && !error && totalMatching > 0 ? (
        <PaginationControls
          label="Service Request pages"
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          summary={`${totalMatching.toLocaleString()} matching`}
        />
      ) : null}
    </section>
  );
}
