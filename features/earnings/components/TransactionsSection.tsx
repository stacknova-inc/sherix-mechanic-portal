"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { CommissionBreakdown } from "@/features/earnings/components/CommissionBreakdown";
import { useTransactions } from "@/features/earnings/hooks/useEarnings";
import type { CompanyTransaction } from "@/features/earnings/types";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 10;
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
      aria-label={`${expanded ? "Hide" : "Show"} commission breakdown for ${transaction.transaction}`}
      className="flex size-8 items-center justify-center rounded-lg text-[#6f7784] transition hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:hover:bg-white/10"
    >
      <ChevronDown className={cn("size-4 transition", expanded && "rotate-180")} aria-hidden="true" />
    </button>
  );
}

export function TransactionsSection() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const query = useTransactions({ page, limit: PAGE_SIZE });
  const transactions = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <SectionCard
      title="Transactions"
      description="Company transaction records and their payment breakdowns. Expand a row to see the server-provided breakdown."
      flush
    >
      {query.isLoading ? (
        <LoadingSkeleton label="Loading transactions…" rows={6} className="p-5" />
      ) : query.isError ? (
        <div className="p-5">
          <QueryErrorState error={query.error} subject="transactions" onRetry={() => void query.refetch()} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No transactions yet"
            description="Customer payments for your Service Requests will appear here."
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
                          <span className="block font-extrabold text-brand-dark dark:text-white">{transaction.transaction}</span>
                          <span className="block text-xs font-semibold text-[#8f96a3]">{transaction.transactionId}</span>
                          <span className="block text-xs font-semibold text-[#8f96a3]">{transaction.formattedDate}</span>
                        </th>
                        <td className="px-3 py-3">
                          <span className="block font-semibold text-[#343a45] dark:text-white/80">{transaction.serviceRequest.code}</span>
                          <span className="block text-xs text-[#8f96a3]">{transaction.serviceRequest.title}</span>
                        </td>
                        <td className="px-3 py-3 text-[#596170] dark:text-white/65">{transaction.mechanic.name}</td>
                        <td className="px-3 py-3"><StatusBadge status={transaction.status} /></td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                          {transaction.formattedGross}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold text-brand-dark dark:text-white">
                          {transaction.formattedCompanyShare}
                        </td>
                      </tr>
                      {expanded ? (
                        <tr id={detailId} className="bg-[#fbfcfd] dark:bg-white/[0.02]">
                          <td colSpan={7} className="px-5 py-4">
                            <p className="mb-3 text-xs font-semibold text-[#6f7784] dark:text-white/55">
                              {transaction.breakdown.headline}
                            </p>
                            <CommissionBreakdown breakdown={transaction.breakdown} />
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
                      <p className="font-extrabold text-brand-dark dark:text-white">{transaction.transaction}</p>
                      <p className="text-xs font-semibold text-[#8f96a3]">{transaction.transactionId}</p>
                      <p className="text-xs text-[#8f96a3]">{transaction.formattedDate}</p>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="font-extrabold text-[#8f96a3]">Service Request</dt><dd className="mt-1">{transaction.serviceRequest.code}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Mechanic</dt><dd className="mt-1">{transaction.mechanic.name}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Gross</dt><dd className="mt-1">{transaction.formattedGross}</dd></div>
                    <div><dt className="font-extrabold text-[#8f96a3]">Company share</dt><dd className="mt-1 font-extrabold">{transaction.formattedCompanyShare}</dd></div>
                  </dl>
                  <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-[#6f7784]">
                    <ExpandButton transaction={transaction} expanded={expanded} controls={detailId} onToggle={() => toggle(transaction.id)} />
                    Commission breakdown
                  </div>
                  {expanded ? (
                    <div id={detailId} className="mt-3">
                      <CommissionBreakdown breakdown={transaction.breakdown} />
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
