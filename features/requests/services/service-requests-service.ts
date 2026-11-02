import { apiClient } from "@/services/http-client";
import { normalizeCurrencyCode, parseAmount } from "@/lib/money";
import { normalizeStatusKey } from "@/features/requests/utils/service-request-status";
import type { CompanyServiceRequest, CompanyServiceRequestPage, ReassignableMechanic, ServiceRequestFilters, ServiceRequestStat } from "@/features/requests/types";

const LIST_PATH = "/service-requests/company-admin/list";
const STATS_PATH = "/service-requests/company-admin/stats";
export const SERVICE_REQUEST_PAGE_LIMIT = 20;

type BackendRef = string | { _id?: string; id?: string; name?: string; fullName?: string; full_name?: string; firstName?: string; lastName?: string; title?: string; email?: string } | null;
type BackendServiceRequest = {
  _id?: string; id?: string; jobId?: string; requestId?: string; status?: string;
  customerName?: string; customerId?: BackendRef; customer?: BackendRef;
  mechanicId?: BackendRef; mechanic?: BackendRef; employee?: BackendRef;
  serviceName?: string; serviceId?: BackendRef; service?: BackendRef;
  actualIssueTitle?: string; originalIssueTitle?: string; customerAddress?: string;
  location?: unknown; finalCost?: number | string; amount?: number | string;
  currency?: string; paymentStatus?: string; isPaid?: boolean;
  scheduledAt?: string; createdAt?: string; updatedAt?: string;
};
type BackendResponse = {
  success?: boolean;
  data?: { serviceRequests?: BackendServiceRequest[]; pagination?: { total?: number; page?: number; limit?: number; pages?: number } };
};

function refId(ref: BackendRef | undefined): string | null {
  return !ref ? null : typeof ref === "string" ? ref : ref._id ?? ref.id ?? null;
}

function refName(ref: BackendRef | undefined): string | null {
  if (!ref || typeof ref === "string") return null;
  const fullName = [ref.firstName, ref.lastName].filter(Boolean).join(" ");
  return ref.name ?? ref.fullName ?? ref.full_name ?? (fullName || null) ?? ref.title ?? ref.email ?? null;
}

function validDate(...values: Array<string | undefined>) {
  return values.find((value) => value && !Number.isNaN(new Date(value).getTime())) ?? null;
}

export function normalizeCompanyServiceRequest(request: BackendServiceRequest): CompanyServiceRequest | null {
  const id = request._id ?? request.id;
  if (!id) return null;
  const customer = request.customerId ?? request.customer;
  const mechanic = request.mechanicId ?? request.mechanic ?? request.employee;
  const service = request.serviceId ?? request.service;
  return {
    id,
    reference: request.jobId ?? request.requestId ?? id,
    status: request.status ? normalizeStatusKey(request.status) || null : null,
    customerName: request.customerName ?? refName(customer),
    mechanicId: refId(mechanic),
    mechanicName: refName(mechanic),
    serviceName: request.serviceName ?? refName(service) ?? request.actualIssueTitle ?? request.originalIssueTitle ?? null,
    location: request.customerAddress ?? (typeof request.location === "string" ? request.location : null),
    paymentStatus: request.paymentStatus ? normalizeStatusKey(request.paymentStatus) || null : typeof request.isPaid === "boolean" ? (request.isPaid ? "paid" : "unpaid") : null,
    amount: parseAmount(request.finalCost ?? request.amount),
    currency: normalizeCurrencyCode(request.currency),
    date: validDate(request.scheduledAt, request.createdAt),
    createdAt: validDate(request.createdAt),
    updatedAt: validDate(request.updatedAt),
  };
}

function buildFilterParams(filters: Partial<ServiceRequestFilters>) {
  const params = new URLSearchParams();
  const values: Array<[string, string | undefined]> = [
    ["status", filters.status], ["search", filters.search?.trim()], ["mechanic", filters.mechanic],
    ["paymentStatus", filters.paymentStatus], ["fromDate", filters.from], ["toDate", filters.to],
  ];
  values.forEach(([key, value]) => { params.set(key, value?.trim() ?? ""); });

  params.set("latitude", "");
  params.set("longitude", "");
  params.set("radiusKm", "50");
  return params;
}

export async function getCompanyServiceRequests(
  filters: Partial<ServiceRequestFilters>, requestedPage: number,
): Promise<CompanyServiceRequestPage> {
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const params = buildFilterParams(filters);
  params.set("page", String(page));
  params.set("limit", String(SERVICE_REQUEST_PAGE_LIMIT));
  params.set("sortBy", "");
  const response = await apiClient.get<BackendResponse>(LIST_PATH, { params });
  const payload = response.data;
  const data = payload?.data;
  const pagination = data?.pagination;
  if (!payload || payload.success !== true || !data || !Array.isArray(data.serviceRequests) || !pagination) {
    throw new Error("The Service Requests response was not in the expected format.");
  }
  const requests = data.serviceRequests.map(normalizeCompanyServiceRequest).filter((item): item is CompanyServiceRequest => item !== null);
  const total = Number(pagination.total);
  const currentPage = Number(pagination.page);
  const limit = Number(pagination.limit);
  const pages = Number(pagination.pages);
  if (![total, currentPage, limit, pages].every(Number.isFinite) || total < 0 || currentPage < 1 || limit < 1 || pages < 0) {
    throw new Error("The Service Requests response contained invalid pagination metadata.");
  }
  return { requests, total, page: currentPage, limit, pages: Math.max(1, pages) };
}

/** Reads all pages for existing dashboard and detail consumers that need a full-history view. */
export async function getAllCompanyServiceRequests(): Promise<CompanyServiceRequest[]> {
  const all: CompanyServiceRequest[] = [];
  let page = 1;
  let pages = 1;
  do {
    const result = await getCompanyServiceRequests({}, page);
    all.push(...result.requests);
    pages = Math.max(1, Math.min(result.pages, 50));
    page = result.page + 1;
  } while (page <= pages);
  return all;
}

function humanizeKey(key: string) {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function statLabel(key: string) {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  const labels: Record<string, string> = {
    total: "All Service Requests",
    all: "All Service Requests",
    totalrequests: "All Service Requests",
    allservicerequests: "All Service Requests",
    totalservicerequests: "All Service Requests",
    opened: "Opened Service Requests",
    open: "Opened Service Requests",
    openedrequests: "Opened Service Requests",
    openrequests: "Opened Service Requests",
    cancelled: "Cancelled Service Requests",
    canceled: "Cancelled Service Requests",
    cancelledrequests: "Cancelled Service Requests",
    canceledrequests: "Cancelled Service Requests",
    reassigned: "Reassigned Service Requests",
    reassignedrequests: "Reassigned Service Requests",
    completed: "Completed Service Requests",
    completedrequests: "Completed Service Requests",
    pending: "Pending Service Requests",
    pendingrequests: "Pending Service Requests",
  };
  return labels[normalized] ?? `${humanizeKey(key)} Service Requests`;
}

export function normalizeServiceRequestStats(payload: unknown): ServiceRequestStat[] {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" && !Array.isArray(root.data) ? root.data as Record<string, unknown> : root;
  const stats: ServiceRequestStat[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      stats.push({ key, label: statLabel(key), value });
      return;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return;

    const group = value as Record<string, unknown>;
    // Some stats responses wrap each count as { value, change }. Use the
    // parent's statistic name as the card title and keep change metadata out
    // of the count cards.
    if (typeof group.value === "number" && Number.isFinite(group.value)) {
      stats.push({ key, label: statLabel(key), value: group.value });
      return;
    }

    Object.entries(group).forEach(([childKey, childValue]) => {
      if (typeof childValue === "number" && Number.isFinite(childValue)) {
        stats.push({ key: `${key}.${childKey}`, label: statLabel(childKey), value: childValue });
      } else if (childValue && typeof childValue === "object" && !Array.isArray(childValue)) {
        const nestedValue = (childValue as Record<string, unknown>).value;
        if (typeof nestedValue === "number" && Number.isFinite(nestedValue)) {
          stats.push({ key: `${key}.${childKey}`, label: statLabel(childKey), value: nestedValue });
        }
      }
    });
  });
  return stats;
}

export async function getCompanyServiceRequestStats(filters: Partial<ServiceRequestFilters> = {}): Promise<ServiceRequestStat[]> {
  const params = buildFilterParams(filters);
  const response = await apiClient.get<unknown>(STATS_PATH, { params });
  const stats = normalizeServiceRequestStats(response.data);
  if (!stats.length) throw new Error("The Service Request statistics response contained no numeric statistics.");
  return stats;
}

type ReassignableMechanicRecord = {
  _id?: string;
  id?: string;
  mechanicId?: string;
  name?: string;
  mechanicName?: string;
  fullName?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
};

function extractMechanicRecords(payload: unknown): ReassignableMechanicRecord[] | null {
  if (Array.isArray(payload)) return payload as ReassignableMechanicRecord[];
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (Array.isArray(data)) return data as ReassignableMechanicRecord[];
  const containers = [root, data, data && typeof data === "object" ? (data as Record<string, unknown>).data : undefined];
  for (const container of containers) {
    if (!container || typeof container !== "object" || Array.isArray(container)) continue;
    const record = container as Record<string, unknown>;
    const mechanics = record.mechanics ?? record.eligibleMechanics ?? record.employees ?? record.docs;
    if (Array.isArray(mechanics)) return mechanics as ReassignableMechanicRecord[];
  }
  return null;
}

export async function getReassignableCompanyMechanics(serviceRequestId: string): Promise<ReassignableMechanic[]> {
  if (!serviceRequestId.trim()) throw new Error("A valid Service Request is required to load available mechanics.");
  const response = await apiClient.get<unknown>(
    `service-requests/company-admin/${encodeURIComponent(serviceRequestId)}/reassignable-mechanics`,
  );
  const records = extractMechanicRecords(response.data);
  if (!records) throw new Error("The eligible mechanics response was not in the expected format.");
  return records.flatMap((mechanic) => {
    const id = mechanic._id ?? mechanic.id ?? mechanic.mechanicId;
    const fullName = [mechanic.firstName, mechanic.lastName].filter(Boolean).join(" ");
    const name = mechanic.name ?? mechanic.mechanicName ?? mechanic.fullName ?? mechanic.full_name ?? fullName;
    return id && name ? [{ id, name }] : [];
  });
}

export async function assignCompanyServiceRequestMechanic(
  serviceRequestId: string,
  mechanicId: string,
  reason: string,
): Promise<void> {
  if (!serviceRequestId.trim() || !mechanicId.trim()) {
    throw new Error("A valid Service Request and mechanic are required.");
  }
  await apiClient.post(`service-requests/company-admin/${encodeURIComponent(serviceRequestId)}/reassign`, {
    mechanicId,
    reason,
  });
}
