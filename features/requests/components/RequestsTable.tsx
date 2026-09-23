"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import type { AdminRequest, RequestSortKey } from "@/features/requests/types";
import { cn } from "@/utils/cn";

interface RequestsTableProps {
  requests: AdminRequest[];
  isLoading?: boolean;
  errorMessage?: string;
  selectedIds: string[];
  sortKey: RequestSortKey;
  sortDirection: "asc" | "desc";
  page: number;
  totalPages: number;
  onToggleAll: () => void;
  onToggleRow: (id: string) => void;
  onSort: (key: RequestSortKey) => void;
  onPageChange: (page: number) => void;
}

const columns: { key: RequestSortKey; label: string }[] = [
  { key: "id", label: "Request ID" },
  { key: "employeeName", label: "Employee Name" },
  { key: "department", label: "Department" },
  { key: "requestType", label: "Request Type" },
  { key: "date", label: "Date" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "assignedTo", label: "Assigned To" },
];

const priorityClasses = {
  Low: "bg-[#f4f5f7] text-[#687386]",
  Medium: "bg-[#fff7d8] text-[#9a6a00]",
  High: "bg-[#ffe8ed] text-brand-red",
  Urgent: "bg-brand-red text-white",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-t border-[#f3f5f7]">
          {Array.from({ length: 9 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-5">
              <div className="h-4 animate-pulse rounded-full bg-[#eef0f3] dark:bg-white/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function RequestsTable({
  requests,
  isLoading = false,
  errorMessage,
  selectedIds,
  sortKey,
  sortDirection,
  page,
  totalPages,
  onToggleAll,
  onToggleRow,
  onSort,
  onPageChange,
}: RequestsTableProps) {
  const allSelected =
    requests.length > 0 && requests.every((request) => selectedIds.includes(request.id));

  return (
    <section className="rounded-xl border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f2f5] px-5 py-4 dark:border-white/10">
        <div className="mr-auto">
          <h2 className="text-lg font-extrabold text-brand-dark dark:text-white">
            Request Queue
          </h2>
          <p className="text-xs font-semibold text-[#8f96a3]">
            {selectedIds.length ? `${selectedIds.length} selected` : "Live operational view"}
          </p>
        </div>
       
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white dark:bg-[#1b1d22]">
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-5">
                  <button
                    onClick={() => onSort(column.key)}
                    className="flex items-center gap-1 transition hover:text-brand-dark dark:hover:text-white"
                  >
                    {column.label}
                    {sortKey === column.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <LoadingSkeleton /> : null}
            {!isLoading && errorMessage ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <p className="text-base font-extrabold text-brand-red">
                    {errorMessage}
                  </p>
                  <p className="mt-1 text-sm text-[#8f96a3]">
                    Check the console for the backend response details.
                  </p>
                </td>
              </tr>
            ) : null}
            {!isLoading && !errorMessage && requests.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <p className="text-base font-extrabold text-brand-dark dark:text-white">
                    No requests found
                  </p>
                  <p className="mt-1 text-sm text-[#8f96a3]">
                    Adjust your search, type filter, or selected tab.
                  </p>
                </td>
              </tr>
            ) : null}
            {!isLoading
              ? requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[#f3f5f7] transition hover:bg-[#fbfcfd] dark:border-white/10 dark:hover:bg-white/[0.03]"
                  >
                    
                    <td className="px-5 py-4 font-semibold text-brand-dark dark:text-white">
                      {request.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                      
                        <span className="font-extrabold text-[#343a45] dark:text-white/85">
                          {request.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {request.department}
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {request.requestType}
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {formatDate(request.date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-extrabold",
                          priorityClasses[request.priority],
                        )}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4 text-[#596170] dark:text-white/65">
                      {request.assignedTo}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-xl bg-[#f1f3f6] dark:bg-white/10"
              />
            ))
          : null}
        {!isLoading && requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#dfe3e9] px-4 py-12 text-center dark:border-white/10">
            <p className="text-base font-extrabold text-brand-dark dark:text-white">
              {errorMessage ?? "No requests found"}
            </p>
            <p className="mt-1 text-sm text-[#8f96a3]">
              {errorMessage
                ? "Check the console for the backend response details."
                : "Adjust your search or filters."}
            </p>
          </div>
        ) : null}
        {!isLoading
          ? requests.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-[#eef0f3] bg-white p-4 shadow-card dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <input
                    aria-label={`Select ${request.id}`}
                    checked={selectedIds.includes(request.id)}
                    onChange={() => onToggleRow(request.id)}
                    type="checkbox"
                    className="mt-1 size-4 rounded border-[#dfe3e9] accent-brand-red"
                  />
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-xs font-extrabold text-[#8f96a3]">
                        {request.id}
                      </p>
                      <h3 className="mt-1 text-base font-extrabold text-brand-dark dark:text-white">
                        {request.employeeName}
                      </h3>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <span>
                        <p className="font-extrabold text-[#8f96a3]">Department</p>
                        <p className="mt-1 text-[#343a45] dark:text-white/75">
                          {request.department}
                        </p>
                      </span>
                      <span>
                        <p className="font-extrabold text-[#8f96a3]">Type</p>
                        <p className="mt-1 text-[#343a45] dark:text-white/75">
                          {request.requestType}
                        </p>
                      </span>
                      <span>
                        <p className="font-extrabold text-[#8f96a3]">Date</p>
                        <p className="mt-1 text-[#343a45] dark:text-white/75">
                          {formatDate(request.date)}
                        </p>
                      </span>
                      <span>
                        <p className="font-extrabold text-[#8f96a3]">Assigned</p>
                        <p className="mt-1 text-[#343a45] dark:text-white/75">
                          {request.assignedTo}
                        </p>
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-extrabold",
                          priorityClasses[request.priority],
                        )}
                      >
                        {request.priority}
                      </span>
                      <StatusBadge status={request.status} />
                    </div>
                  </div>
                </div>
              </article>
            ))
          : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#f0f2f5] px-5 py-4 text-xs font-extrabold text-[#6f7784] dark:border-white/10 sm:flex-row sm:items-center">
        <span className="mr-auto">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex size-8 items-center justify-center rounded-lg transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const nextPage = index + 1;

            return (
              <button
                key={nextPage}
                onClick={() => onPageChange(nextPage)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition",
                  page === nextPage
                    ? "bg-brand-red text-white"
                    : "hover:bg-[#f7f8fa] dark:hover:bg-white/10",
                )}
              >
                {nextPage}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex size-8 items-center justify-center rounded-lg transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
