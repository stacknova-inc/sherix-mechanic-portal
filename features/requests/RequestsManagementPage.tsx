"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { ServiceRequestStatsRow } from "@/features/requests/components/ServiceRequestStatsRow";
import { RequestsHeader } from "@/features/requests/components/RequestsHeader";
import { RequestsTable } from "@/features/requests/components/RequestsTable";
import { ReassignServiceRequestDialog } from "@/features/requests/components/ReassignServiceRequestDialog";
import { useCompanyServiceRequestPage } from "@/features/requests/hooks/useCompanyServiceRequests";
import type { CompanyServiceRequest, ServiceRequestFilters } from "@/features/requests/types";
import {
  buildServiceRequestSearchParams,
  defaultServiceRequestFilters,
  getDistinctOptions,
  getMechanicKey,
  getMechanicLabel,
  parsePageParam,
  parseServiceRequestFilters,
  sortServiceRequests,
} from "@/features/requests/utils/service-request-filters";
import { formatStatusLabel } from "@/features/requests/utils/service-request-status";

const SEARCH_DEBOUNCE_MS = 300;
const NO_REQUESTS: CompanyServiceRequest[] = [];

export function RequestsManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseServiceRequestFilters(searchParams), [searchParams]);
  const requestedPage = parsePageParam(searchParams);
  const requestsQuery = useCompanyServiceRequestPage(filters, requestedPage);
  const requests = useMemo(
    () => sortServiceRequests(requestsQuery.data?.requests ?? NO_REQUESTS, filters.sort),
    [requestsQuery.data?.requests, filters.sort],
  );

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [requestToReassign, setRequestToReassign] = useState<CompanyServiceRequest | null>(null);
  const lastPushedSearch = useRef(filters.search);

  const replaceUrl = useCallback(
    (nextFilters: ServiceRequestFilters, page: number) => {
      const query = buildServiceRequestSearchParams(nextFilters, page).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  // Filter changes always return to the first page.
  function updateFilters(next: Partial<ServiceRequestFilters>) {
    replaceUrl({ ...filters, ...next }, 1);
  }

  function clearFilters() {
    lastPushedSearch.current = "";
    setSearchDraft("");
    replaceUrl(defaultServiceRequestFilters, 1);
  }

  useEffect(() => {
    if (searchDraft === filters.search) {
      return;
    }

    // Depends on the full filter state so a filter changed mid-debounce is not overwritten.
    const timeout = window.setTimeout(() => {
      lastPushedSearch.current = searchDraft;
      replaceUrl({ ...filters, search: searchDraft }, 1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchDraft, filters, replaceUrl]);

  // Adopt search values that arrive from navigation (drill-down links, back button)
  // without overwriting text the user is still typing.
  useEffect(() => {
    if (filters.search !== lastPushedSearch.current) {
      lastPushedSearch.current = filters.search;
      setSearchDraft(filters.search);
    }
  }, [filters.search]);

  const pagination = requestsQuery.data;

  useEffect(() => {
    if (pagination && pagination.page !== requestedPage) replaceUrl(filters, pagination.page);
  }, [pagination?.page, requestedPage, filters, replaceUrl]);

  const statusOptions = useMemo(
    () => getDistinctOptions(requests, (request) => request.status, (_request, value) => formatStatusLabel(value)),
    [requests],
  );
  const mechanicOptions = useMemo(
    () => getDistinctOptions(requests, getMechanicKey, getMechanicLabel),
    [requests],
  );
  const paymentStatusOptions = useMemo(
    () => getDistinctOptions(requests, (request) => request.paymentStatus, (_request, value) => formatStatusLabel(value)),
    [requests],
  );

  const hasActiveFilters =
    Boolean(searchDraft.trim()) ||
    Boolean(filters.status || filters.mechanic || filters.paymentStatus || filters.from || filters.to);

  return (
    <DashboardShell>
      <RequestsHeader
        searchValue={searchDraft}
        filters={filters}
        statusOptions={statusOptions}
        mechanicOptions={mechanicOptions}
        paymentStatusOptions={paymentStatusOptions}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchDraft}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
      />

      <div className="space-y-7">
        <ServiceRequestStatsRow filters={filters} />

        <RequestsTable
          requests={requests}
          isLoading={requestsQuery.isLoading}
          error={requestsQuery.isError ? requestsQuery.error : null}
          hasAnyRequests={(pagination?.total ?? 0) > 0}
          hasActiveFilters={hasActiveFilters}
          page={pagination?.page ?? requestedPage}
          totalPages={pagination?.pages ?? 1}
          totalMatching={pagination?.total ?? 0}
          onPageChange={(page) => replaceUrl(filters, page)}
          onRetry={() => void requestsQuery.refetch()}
          onClearFilters={clearFilters}
          onReassign={setRequestToReassign}
        />
      </div>
      {requestToReassign ? (
        <ReassignServiceRequestDialog
          request={requestToReassign}
          onClose={() => setRequestToReassign(null)}
        />
      ) : null}
    </DashboardShell>
  );
}
