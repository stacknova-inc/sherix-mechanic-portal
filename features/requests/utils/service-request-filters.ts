import type {
  CompanyServiceRequest,
  ServiceRequestFilters,
  ServiceRequestSort,
} from "@/features/requests/types";

export const SERVICE_REQUEST_PAGE_SIZE = 10;

export const defaultServiceRequestFilters: ServiceRequestFilters = {
  search: "",
  status: "",
  mechanic: "",
  paymentStatus: "",
  from: "",
  to: "",
  sort: "newest",
};

const FILTER_PARAM_KEYS = {
  search: "q",
  status: "status",
  mechanic: "mechanic",
  paymentStatus: "payment",
  from: "from",
  to: "to",
  sort: "sort",
} as const satisfies Record<keyof ServiceRequestFilters, string>;

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NAME_KEY_PREFIX = "name:";

/**
 * Mechanic filter key: the backend id when the record is populated, otherwise
 * the display name. Used consistently by history filters and performance
 * drill-downs so both resolve to the same set of Service Requests.
 */
export function getMechanicKey(request: Pick<CompanyServiceRequest, "mechanicId" | "mechanicName">) {
  if (request.mechanicId) {
    return request.mechanicId;
  }

  return request.mechanicName ? `${NAME_KEY_PREFIX}${request.mechanicName}` : null;
}

/** Display name for the assigned mechanic, including records that only carry a mechanic id. */
export function getMechanicLabel(request: Pick<CompanyServiceRequest, "mechanicId" | "mechanicName">) {
  if (request.mechanicName) {
    return request.mechanicName;
  }

  return request.mechanicId ? `Mechanic …${request.mechanicId.slice(-6)}` : "Unassigned";
}

/** Formats a Date as a local YYYY-MM-DD value, matching `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseLocalDate(value: string, endOfDay: boolean): number | null {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function isWithinDateRange(value: string | null, from: string, to: string): boolean {
  const start = from ? parseLocalDate(from, false) : null;
  const end = to ? parseLocalDate(to, true) : null;

  if (start === null && end === null) {
    return true;
  }

  // An undated record cannot be proven to fall inside a requested period.
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return (start === null || timestamp >= start) && (end === null || timestamp <= end);
}

function matchesSearch(request: CompanyServiceRequest, query: string) {
  if (!query) {
    return true;
  }

  return [
    request.reference,
    request.id,
    request.customerName,
    request.mechanicName,
    request.serviceName,
    request.location,
    request.status,
    request.paymentStatus,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/_/g, " ")
    .includes(query);
}

function getSortTimestamp(request: CompanyServiceRequest) {
  const timestamp = request.date ? new Date(request.date).getTime() : Number.NaN;
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function sortServiceRequests(
  requests: CompanyServiceRequest[],
  sort: ServiceRequestSort,
): CompanyServiceRequest[] {
  const direction = sort === "oldest" ? 1 : -1;

  return [...requests].sort((first, second) => {
    const firstTime = getSortTimestamp(first);
    const secondTime = getSortTimestamp(second);

    // Undated records always sort last, regardless of direction.
    if (firstTime === null || secondTime === null) {
      return firstTime === secondTime ? 0 : firstTime === null ? 1 : -1;
    }

    return (firstTime - secondTime) * direction;
  });
}

export function filterServiceRequests(
  requests: CompanyServiceRequest[],
  filters: ServiceRequestFilters,
): CompanyServiceRequest[] {
  const query = filters.search.trim().toLowerCase().replace(/_/g, " ");

  const filtered = requests.filter(
    (request) =>
      (!filters.status || request.status === filters.status) &&
      (!filters.mechanic || getMechanicKey(request) === filters.mechanic) &&
      (!filters.paymentStatus || request.paymentStatus === filters.paymentStatus) &&
      isWithinDateRange(request.date, filters.from, filters.to) &&
      matchesSearch(request, query),
  );

  return sortServiceRequests(filtered, filters.sort);
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    page: currentPage,
    totalPages,
  };
}

export type FilterOption = { value: string; label: string };

/** Filter options come only from values present in the returned records; no enum is assumed. */
export function getDistinctOptions(
  requests: CompanyServiceRequest[],
  getValue: (request: CompanyServiceRequest) => string | null,
  getLabel: (request: CompanyServiceRequest, value: string) => string,
): FilterOption[] {
  const options = new Map<string, string>();

  requests.forEach((request) => {
    const value = getValue(request);
    if (value && !options.has(value)) {
      options.set(value, getLabel(request, value));
    }
  });

  return Array.from(options, ([value, label]) => ({ value, label })).sort((first, second) =>
    first.label.localeCompare(second.label),
  );
}

export function parseServiceRequestFilters(params: URLSearchParams): ServiceRequestFilters {
  const read = (key: keyof ServiceRequestFilters) => params.get(FILTER_PARAM_KEYS[key])?.trim() ?? "";
  const from = read("from");
  const to = read("to");

  return {
    search: read("search"),
    status: read("status"),
    mechanic: read("mechanic"),
    paymentStatus: read("paymentStatus"),
    from: DATE_INPUT_PATTERN.test(from) ? from : "",
    to: DATE_INPUT_PATTERN.test(to) ? to : "",
    sort: read("sort") === "oldest" ? "oldest" : "newest",
  };
}

export function parsePageParam(params: URLSearchParams): number {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function buildServiceRequestSearchParams(
  filters: Partial<ServiceRequestFilters>,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();

  (Object.keys(FILTER_PARAM_KEYS) as Array<keyof ServiceRequestFilters>).forEach((key) => {
    const value = filters[key];
    if (value && value !== defaultServiceRequestFilters[key]) {
      params.set(FILTER_PARAM_KEYS[key], value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}

export function buildServiceRequestHistoryHref(filters: Partial<ServiceRequestFilters>): string {
  const query = buildServiceRequestSearchParams(filters).toString();
  return query ? `/requests?${query}` : "/requests";
}

export function getServiceRequestHref(request: Pick<CompanyServiceRequest, "id">): string {
  return `/requests/${encodeURIComponent(request.id)}`;
}
