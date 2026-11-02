"use client";

import { useState } from "react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { fieldClassName, fieldLabelClassName, secondaryButtonClassName } from "@/features/dashboard/components/form-styles";
import { usePayouts } from "@/features/earnings/hooks/useEarnings";
import type { PayoutStatus } from "@/features/earnings/types";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { formatDate } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 8;
const METHOD_LABELS = { mobile_money: "Mobile money", bank_transfer: "Bank transfer" } as const;

export function PayoutHistory() {
  const [status, setStatus] = useState<PayoutStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const query = usePayouts({ status, from, to, page, limit: PAGE_SIZE });
  const payouts = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  const hasFilters = Boolean(status || from || to);

  return (
    <SectionCard
      title="Payout history"
      description="Payout requests sent to your mechanics, including processing dates and outcomes."
      badge={<SampleDataBadge />}
      flush
      actions={
        <>
        <div className="w-full sm:w-48">
          <label htmlFor="payout-status" className={fieldLabelClassName}>Status</label>
          <select
            id="payout-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as PayoutStatus | "");
              setPage(1);
            }}
            className={fieldClassName}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="payout-from" className={fieldLabelClassName}>From date</label>
          <input id="payout-from" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={fieldClassName} />
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="payout-to" className={fieldLabelClassName}>To date</label>
          <input id="payout-to" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={fieldClassName} />
        </div>
        <button type="button" disabled={!hasFilters} onClick={() => { setStatus(""); setFrom(""); setTo(""); setPage(1); }} className={secondaryButtonClassName}>Clear filters</button>
        </>
      }
    >
      {query.isLoading ? (
        <LoadingSkeleton label="Loading payouts…" rows={5} className="p-5" rowClassName="h-16" />
      ) : query.isError ? (
        <div className="p-5">
          <QueryErrorState error={query.error} subject="payout history" onRetry={() => void query.refetch()} />
        </div>
      ) : payouts.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title={status ? "No payouts with this status" : "No payouts yet"}
            description="Payouts appear here once mechanics complete paid Service Requests."
          />
        </div>
      ) : (
        <div aria-busy={query.isFetching} className={cn(query.isPlaceholderData && "opacity-60")}>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Payout history, page {pagination?.page} of {pagination?.pages}</caption>
              <thead><tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
                <th scope="col" className="px-5 py-4">Payout</th><th scope="col" className="px-3 py-4">Mechanic</th>
                <th scope="col" className="px-3 py-4">Method</th><th scope="col" className="px-3 py-4">Requested</th>
                <th scope="col" className="px-3 py-4">Completed</th><th scope="col" className="px-3 py-4">Status</th>
                <th scope="col" className="px-5 py-4 text-right">Amount</th>
              </tr></thead>
              <tbody>{payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-[#f3f5f7] dark:border-white/10">
                  <th scope="row" className="px-5 py-4 text-left font-extrabold text-brand-dark dark:text-white">{payout.reference}
                    {payout.failureReason ? <span className="mt-1 block max-w-56 text-xs font-semibold text-[#be123c] dark:text-red-300">{payout.failureReason}</span> : null}
                  </th>
                  <td className="px-3 py-4">{payout.mechanic.name}</td><td className="px-3 py-4">{METHOD_LABELS[payout.method]}</td>
                  <td className="px-3 py-4">{formatDate(payout.initiatedAt)}</td><td className="px-3 py-4">{payout.completedAt ? formatDate(payout.completedAt) : "—"}</td>
                  <td className="px-3 py-4"><StatusBadge status={payout.status} srLabel="Payout status" /></td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-extrabold text-brand-dark dark:text-white">{formatMoney(payout.amount, payout.currency)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <ul className="space-y-3 p-4 lg:hidden">
          {payouts.map((payout) => (
            <li key={payout.id} className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-brand-dark dark:text-white">{payout.mechanic.name}</p>
                <p className="text-xs font-semibold text-[#8f96a3]">
                  {payout.reference} · {METHOD_LABELS[payout.method]} · {payout.transactionIds.length} transaction
                  {payout.transactionIds.length === 1 ? "" : "s"} · initiated {formatDate(payout.initiatedAt)}
                  {payout.completedAt ? ` · paid ${formatDate(payout.completedAt)}` : ""}
                </p>
                {payout.failureReason ? (
                  <p className="mt-1 text-xs font-semibold text-[#be123c] dark:text-red-300">{payout.failureReason}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <StatusBadge status={payout.status} srLabel="Payout status" />
                <span className="whitespace-nowrap font-extrabold text-brand-dark dark:text-white">
                  {formatMoney(payout.amount, payout.currency)}
                </span>
              </div>
            </li>
          ))}
          </ul>
        </div>
      )}

      {pagination && pagination.total > 0 && !query.isError ? (
        <PaginationControls
          label="Payout pages"
          page={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
          disabled={query.isPlaceholderData}
          summary={`${pagination.total.toLocaleString()} payouts`}
        />
      ) : null}
    </SectionCard>
  );
}
