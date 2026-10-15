"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import {
  fieldClassName,
  fieldLabelClassName,
  secondaryButtonClassName,
} from "@/features/dashboard/components/form-styles";
import { CommissionBreakdown } from "@/features/earnings/components/CommissionBreakdown";
import { useTransactions } from "@/features/earnings/hooks/useEarnings";
import type { CompanyTransaction, TransactionStatus } from "@/features/earnings/types";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { formatDateTime } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: Array<{ value: TransactionStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];
const PAYMENT_METHOD_LABELS = { card: "Card", mobile_money: "Mobile money", cash: "Cash" } as const;

function ExpandButton({
  transaction,
  expanded,
  controls,
  onToggle,
}: {
  transaction: CompanyTransaction;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={`${expanded ? "Hide" : "Show"} commission breakdown for ${transaction.reference}`}
      className="flex size-8 items-center justify-center rounded-lg text-[#6f7784] transition hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:hover:bg-white/10"
    >
      <ChevronDown className={cn("size-4 transition", expanded && "rotate-180")} aria-hidden="true" />
    </button>
  );
}

export function TransactionsSection() {
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const query = useTransactions({ status, from, to, page, limit: PAGE_SIZE });
  const transactions = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  const hasFilters = Boolean(status || from || to);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
      setExpandedId(null);
    };
  }

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <SectionCard
      title="Transactions"
      description="Every customer payment for your Service Requests. Expand a row to see its commission breakdown."
      badge={<SampleDataBadge />}
      flush
    >
      <fieldset className="grid gap-3 border-b border-[#f0f2f5] p-5 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <legend className="sr-only">Filter transactions</legend>
        <div>
          <label htmlFor="transaction-status" className={fieldLabelClassName}>Status</label>
          <select
            id="transaction-status"
            value={status}
            onChange={(event) => resetPage(setStatus)(event.target.value as TransactionStatus | "")}
            className={fieldClassName}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="transaction-from" className={fieldLabelClassName}>From date</label>
          <input
            id="transaction-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => resetPage(setFrom)(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="transaction-to" className={fieldLabelClassName}>To date</label>
          <input
            id="transaction-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => resetPage(setTo)(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setStatus("");
              setFrom("");
              setTo("");
              setPage(1);
            }}
            className={cn(secondaryButtonClassName, "w-full")}
          >
            Clear filters
          </button>
        </div>
      </fieldset>

      {query.isLoading ? (
        <LoadingSkeleton label="Loading transactions…" rows={6} className="p-5" />
      ) : query.isError ? (
        <div className="p-5">
          <QueryErrorState error={query.error} subject="transactions" onRetry={() => void query.refetch()} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title={hasFilters ? "No transactions match these filters" : "No transactions yet"}
            description={
              hasFilters
                ? "Try another status or a wider date range."
                : "Customer payments for your Service Requests will appear here."
            }
          />
        </div>
      ) : (
        <div className={cn(query.isPlaceholderData && "opacity-60")} aria-busy={query.isFetching}>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Transactions, page {pagination?.page} of {pagination?.pages}</caption>
              <thead>
                <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
                  <th scope="col" className="w-12 px-5 py-4"><span className="sr-only">Breakdown</span></th>
                  <th scope="col" className="px-3 py-4">Transaction</th>
                  <th scope="col" className="px-3 py-4">Service Request</th>
                  <th scope="col" className="px-3 py-4">Mechanic</th>
                  <th scope="col" className="px-3 py-4">Status</th>
                  <th scope="col" className="px-3 py-4 text-right">Gross</th>
                  <th scope="col" className="px-5 py-4 text-right">Company share</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const expanded = expandedId === transaction.id;
                  const detailId = `transaction-breakdown-${transaction.id}`;

                  return (
                    <Fragment key={transaction.id}>
                      <tr className="border-t border-[#f3f5f7] dark:border-white/10">
                        <td className="px-5 py-3">
                          <ExpandButton transaction={transaction} expanded={expanded} controls={detailId} onToggle={() => toggle(transaction.id)} />
                        </td>
                        <th scope="row" className="px-3 py-3 text-left">
                          <span className="block font-extrabold text-brand-dark dark:text-white">{transaction.reference}</span>
                          <span className="block text-xs font-semibold text-[#8f96a3]">{formatDateTime(transaction.createdAt)}</span>
                        </th>
                        <td className="px-3 py-3">
                          <span className="block font-semibold text-[#343a45] dark:text-white/80">{transaction.serviceRequestRef}</span>
                          <span className="block text-xs text-[#8f96a3]">{transaction.serviceName}</span>
                        </td>
                        <td className="px-3 py-3 text-[#596170] dark:text-white/65">{transaction.mechanic.name}</td>
                        <td className="px-3 py-3"><StatusBadge status={transaction.status} /></td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                          {formatMoney(transaction.breakdown.grossAmount, transaction.currency)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold text-brand-dark dark:text-white">
                          {formatMoney(transaction.breakdown.companyShare, transaction.currency)}
                        </td>
                      </tr>
                      {expanded ? (
                        <tr id={detailId} className="bg-[#fbfcfd] dark:bg-white/[0.02]">
                          <td colSpan={7} className="px-5 py-4">
                            <p className="mb-3 text-xs font-semibold text-[#6f7784] dark:text-white/55">
                              {PAYMENT_METHOD_LABELS[transaction.paymentMethod]} payment from {transaction.customerName}
                              {transaction.settledAt ? ` · settled ${formatDateTime(transaction.settledAt)}` : " · not settled yet"}
                            </p>
                            <CommissionBreakdown breakdown={transaction.breakdown} currency={transaction.currency} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 p-4 lg:hidden">
            {transactions.map((transaction) => {
              const expanded = expandedId === transaction.id;
              const detailId = `transaction-breakdown-mobile-${transaction.id}`;

              return (
                <li key={transaction.id} className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-brand-dark dark:text-white">{transaction.reference}</p>
                      <p className="text-xs text-[#8f96a3]">{formatDateTime(transaction.createdAt)}</p>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="font-extrabold text-[#8f96a3]">Service Request</dt><dd className="mt-1">{transaction.serviceRequestRef}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Mechanic</dt><dd className="mt-1">{transaction.mechanic.name}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Gross</dt><dd className="mt-1">{formatMoney(transaction.breakdown.grossAmount, transaction.currency)}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Company share</dt><dd className="mt-1 font-extrabold">{formatMoney(transaction.breakdown.companyShare, transaction.currency)}</dd></div>
                  </dl>
                  <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-[#6f7784]">
                    <ExpandButton transaction={transaction} expanded={expanded} controls={detailId} onToggle={() => toggle(transaction.id)} />
                    Commission breakdown
                  </div>
                  {expanded ? (
                    <div id={detailId} className="mt-3">
                      <CommissionBreakdown breakdown={transaction.breakdown} currency={transaction.currency} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {pagination && pagination.total > 0 && !query.isError ? (
        <PaginationControls
          label="Transaction pages"
          page={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(next) => {
            setPage(next);
            setExpandedId(null);
          }}
          disabled={query.isPlaceholderData}
          summary={`${pagination.total.toLocaleString()} transactions`}
        />
      ) : null}
    </SectionCard>
  );
}
