"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
} from "lucide-react";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { RequestStatsCard } from "@/features/requests/components/RequestStatsCard";
import { RequestTabs, type RequestTab } from "@/features/requests/components/RequestTabs";
import { RequestsHeader } from "@/features/requests/components/RequestsHeader";
import { RequestsTable } from "@/features/requests/components/RequestsTable";
import { requestData, requestStats } from "@/features/requests/data";
import type { AdminRequest, RequestSortKey } from "@/features/requests/types";

const statsIcons = [FileText, Clock3, CheckCircle2, FileCheck2];
const pageSize = 6;
const priorityRank = { Low: 1, Medium: 2, High: 3, Urgent: 4 };

function getSortValue(request: AdminRequest, key: RequestSortKey) {
  if (key === "date") {
    return new Date(request.date).getTime();
  }

  if (key === "priority") {
    return priorityRank[request.priority];
  }

  return request[key].toLowerCase();
}

export function RequestsManagementPage() {
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<RequestTab>("All");
  const [sortKey, setSortKey] = useState<RequestSortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const isLoading = false;

  const counts = useMemo(
    () => ({
      All: requestData.length,
      Pending: requestData.filter((request) => request.status === "Pending").length,
      Approved: requestData.filter((request) => request.status === "Approved").length,
      Rejected: requestData.filter((request) => request.status === "Rejected").length,
      "In Review": requestData.filter((request) => request.status === "In Review").length,
      Completed: requestData.filter((request) => request.status === "Completed").length,
    }),
    [],
  );

  const filteredRequests = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return requestData
      .filter((request) => activeTab === "All" || request.status === activeTab)
      .filter((request) => typeFilter === "all" || request.requestType === typeFilter)
      .filter((request) => {
        if (!query) {
          return true;
        }

        return [
          request.id,
          request.employeeName,
          request.department,
          request.requestType,
          request.status,
          request.assignedTo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((first, second) => {
        const firstValue = getSortValue(first, sortKey);
        const secondValue = getSortValue(second, sortKey);
        const modifier = sortDirection === "asc" ? 1 : -1;

        if (firstValue > secondValue) {
          return modifier;
        }

        if (firstValue < secondValue) {
          return -modifier;
        }

        return 0;
      });
  }, [activeTab, searchValue, sortDirection, sortKey, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSort(key: RequestSortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  function handleTabChange(tab: RequestTab) {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds([]);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleFilterChange(value: string) {
    setTypeFilter(value);
    setPage(1);
  }

  function handleToggleAll() {
    const visibleIds = pagedRequests.map((request) => request.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  function handleToggleRow(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-7">
        <RequestsHeader
          searchValue={searchValue}
          filterValue={typeFilter}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {requestStats.map((stat, index) => (
            <RequestStatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              helper={stat.helper}
              tone={stat.tone}
              icon={statsIcons[index]}
            />
          ))}
        </div>

        <RequestTabs
          activeTab={activeTab}
          counts={counts}
          onChange={handleTabChange}
        />

        <RequestsTable
          requests={pagedRequests}
          isLoading={isLoading}
          selectedIds={selectedIds}
          sortKey={sortKey}
          sortDirection={sortDirection}
          page={currentPage}
          totalPages={totalPages}
          onToggleAll={handleToggleAll}
          onToggleRow={handleToggleRow}
          onSort={handleSort}
          onPageChange={setPage}
        />
      </div>
    </DashboardShell>
  );
}
