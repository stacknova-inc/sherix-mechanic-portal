"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { fieldClassName } from "@/features/dashboard/components/form-styles";
import type { MechanicQualityMetrics } from "@/features/performance/types";
import {
  filterQualityMetrics,
  formatMinutes,
  formatRating,
  sortQualityMetrics,
  type QualitySortKey,
  type SortDirection,
} from "@/features/performance/utils/quality-metrics";
import { formatRate } from "@/features/performance/utils/mechanic-performance";
import { formatMoney } from "@/lib/money";

interface MechanicQualityTableProps {
  rows: MechanicQualityMetrics[];
  currency: string;
  periodLabel: string;
}

const COLUMNS: Array<{ key: QualitySortKey; label: string; numeric?: boolean }> = [
  { key: "mechanicName", label: "Mechanic" },
  { key: "acceptanceRate", label: "Acceptance rate", numeric: true },
  { key: "avgResponseMinutes", label: "Avg response", numeric: true },
  { key: "averageRating", label: "Rating", numeric: true },
  { key: "earnings", label: "Earnings", numeric: true },
  { key: "disputeCount", label: "Disputes", numeric: true },
];

export function MechanicQualityTable({ rows, currency, periodLabel }: MechanicQualityTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<QualitySortKey>("earnings");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const visibleRows = useMemo(
    () => sortQualityMetrics(filterQualityMetrics(rows, search), sortKey, direction),
    [rows, search, sortKey, direction],
  );

  function changeSort(key: QualitySortKey) {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(key === "mechanicName" || key === "avgResponseMinutes" || key === "disputeCount" ? "asc" : "desc");
  }

  function cells(row: MechanicQualityMetrics) {
    return {
      acceptanceRate: formatRate(row.acceptanceRate),
      avgResponseMinutes: formatMinutes(row.avgResponseMinutes),
      averageRating: `${formatRating(row.averageRating)}${row.ratingCount ? ` (${row.ratingCount})` : ""}`,
      earnings: formatMoney(row.earnings, currency),
      disputeCount: row.disputeCount.toLocaleString(),
    };
  }

  return (
    <div>
      <div className="border-b border-[#f0f2f5] p-5 dark:border-white/10">
        <label htmlFor="quality-search" className="sr-only">Filter mechanics by name</label>
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]" aria-hidden="true" />
          <input
            id="quality-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter mechanics by name"
            className={`${fieldClassName} pl-10`}
          />
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title={rows.length ? "No mechanics match that name" : "No mechanic metrics for this selection"}
            description={rows.length ? "Try a different name." : "Choose a different period or mechanic."}
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Mechanic quality and earnings, {periodLabel}. Column headers sort the table.</caption>
              <thead>
                <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
                  {COLUMNS.map((column) => {
                    const active = sortKey === column.key;
                    const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
                        className={column.numeric ? "px-4 py-3 text-right" : "px-5 py-3"}
                      >
                        <button
                          type="button"
                          onClick={() => changeSort(column.key)}
                          className="inline-flex items-center gap-1 rounded uppercase transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:hover:text-white"
                        >
                          {column.label}
                          <Icon className="size-3" aria-hidden="true" />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const values = cells(row);
                  return (
                    <tr key={row.mechanicId} className="border-t border-[#f3f5f7] dark:border-white/10">
                      <th scope="row" className="px-5 py-3 font-extrabold text-[#343a45] dark:text-white/85">{row.mechanicName}</th>
                      <td className="px-4 py-3 text-right">{values.acceptanceRate}</td>
                      <td className="px-4 py-3 text-right">{values.avgResponseMinutes}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">{values.averageRating}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{values.earnings}</td>
                      <td className="px-4 py-3 text-right">{values.disputeCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 md:hidden">
            <label htmlFor="quality-sort-mobile" className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#8a929e]">Sort by</label>
            <select
              id="quality-sort-mobile"
              value={`${sortKey}:${direction}`}
              onChange={(event) => {
                const [key, dir] = event.target.value.split(":") as [QualitySortKey, SortDirection];
                setSortKey(key);
                setDirection(dir);
              }}
              className={fieldClassName}
            >
              {COLUMNS.flatMap((column) => [
                <option key={`${column.key}:desc`} value={`${column.key}:desc`}>{column.label} (high → low)</option>,
                <option key={`${column.key}:asc`} value={`${column.key}:asc`}>{column.label} (low → high)</option>,
              ])}
            </select>
            <ul className="mt-4 space-y-3">
              {visibleRows.map((row) => {
                const values = cells(row);
                return (
                  <li key={row.mechanicId} className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
                    <p className="font-extrabold text-brand-dark dark:text-white">{row.mechanicName}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      {COLUMNS.slice(1).map((column) => (
                        <div key={column.key}>
                          <dt className="font-extrabold text-[#8f96a3]">{column.label}</dt>
                          <dd className="mt-1 text-sm">{values[column.key as Exclude<QualitySortKey, "mechanicName">]}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
