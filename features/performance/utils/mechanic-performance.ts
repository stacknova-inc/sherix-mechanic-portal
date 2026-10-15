import type { CompanyServiceRequest } from "@/features/requests/types";
import {
  buildServiceRequestHistoryHref,
  defaultServiceRequestFilters,
  filterServiceRequests,
  getMechanicKey,
  getMechanicLabel,
} from "@/features/requests/utils/service-request-filters";
import {
  CANCELLED_STATUS,
  COMPLETED_STATUS,
} from "@/features/requests/utils/service-request-status";

export {
  DEFAULT_REPORTING_PERIOD as DEFAULT_PERFORMANCE_PERIOD,
  REPORTING_PERIODS as PERFORMANCE_PERIODS,
  getPeriodLabel,
  getPeriodRange,
  parseReportingPeriod as parsePerformancePeriod,
  type ReportingPeriod as PerformancePeriod,
} from "@/lib/periods";

export interface PerformanceScope {
  /** Inclusive local YYYY-MM-DD bounds; "" means unbounded. */
  from: string;
  to: string;
  /** Mechanic key; "" means every mechanic. */
  mechanic: string;
}

export interface PerformanceCounts {
  assigned: number;
  completed: number;
  cancelled: number;
  /** cancelled / assigned, or null when nothing was assigned in scope. */
  cancellationRate: number | null;
}

export interface MechanicPerformanceRow extends PerformanceCounts {
  mechanicKey: string;
  mechanicId: string | null;
  mechanicName: string;
}

export interface MechanicPerformanceSummary {
  totals: PerformanceCounts;
  rows: MechanicPerformanceRow[];
  /** Service Requests in scope that have no assigned mechanic. */
  unassigned: number;
}

function countOutcomes(requests: CompanyServiceRequest[]): PerformanceCounts {
  const assigned = requests.length;
  const completed = requests.filter((request) => request.status === COMPLETED_STATUS).length;
  const cancelled = requests.filter((request) => request.status === CANCELLED_STATUS).length;

  return {
    assigned,
    completed,
    cancelled,
    cancellationRate: assigned > 0 ? cancelled / assigned : null,
  };
}

/**
 * Aggregates Service Requests in scope. Scoping reuses the history page's
 * filter logic, so each count equals the number of rows its drill-down shows.
 */
export function buildMechanicPerformance(
  requests: CompanyServiceRequest[],
  scope: PerformanceScope,
): MechanicPerformanceSummary {
  const inScope = filterServiceRequests(requests, {
    ...defaultServiceRequestFilters,
    from: scope.from,
    to: scope.to,
    mechanic: scope.mechanic,
  });

  const byMechanic = new Map<string, CompanyServiceRequest[]>();
  let unassigned = 0;

  inScope.forEach((request) => {
    const key = getMechanicKey(request);

    if (!key) {
      unassigned += 1;
      return;
    }

    byMechanic.set(key, [...(byMechanic.get(key) ?? []), request]);
  });

  const rows = Array.from(byMechanic, ([mechanicKey, mechanicRequests]) => ({
    mechanicKey,
    mechanicId: mechanicRequests[0].mechanicId,
    mechanicName: getMechanicLabel(mechanicRequests[0]),
    ...countOutcomes(mechanicRequests),
  })).sort(
    (first, second) =>
      second.completed - first.completed || first.mechanicName.localeCompare(second.mechanicName),
  );

  return { totals: countOutcomes(inScope), rows, unassigned };
}

export function formatRate(rate: number | null): string {
  if (rate === null) {
    return "Not available";
  }

  return new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(rate);
}

export function buildPerformanceDrillDownHref(
  scope: PerformanceScope,
  status?: typeof COMPLETED_STATUS | typeof CANCELLED_STATUS,
  mechanicKey?: string,
): string {
  return buildServiceRequestHistoryHref({
    from: scope.from,
    to: scope.to,
    mechanic: mechanicKey ?? scope.mechanic,
    status: status ?? "",
  });
}
