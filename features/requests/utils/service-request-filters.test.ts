import { describe, expect, it } from "vitest";
import type { CompanyServiceRequest } from "@/features/requests/types";
import {
  buildServiceRequestHistoryHref,
  buildServiceRequestSearchParams,
  defaultServiceRequestFilters,
  filterServiceRequests,
  getDistinctOptions,
  getMechanicKey,
  getServiceRequestHref,
  isWithinDateRange,
  paginate,
  parsePageParam,
  parseServiceRequestFilters,
} from "@/features/requests/utils/service-request-filters";

function makeRequest(overrides: Partial<CompanyServiceRequest>): CompanyServiceRequest {
  return {
    id: "id",
    reference: "SR-0",
    status: "completed",
    customerName: "Customer",
    mechanicId: "mech-1",
    mechanicName: "Kofi",
    serviceName: "Oil change",
    location: null,
    paymentStatus: "paid",
    amount: 100,
    currency: "GHS",
    date: "2026-09-10T12:00:00",
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const requests = [
  makeRequest({ id: "a", reference: "SR-1", date: "2026-09-01T09:00:00", customerName: "Ama Mensah" }),
  makeRequest({ id: "b", reference: "SR-2", status: "cancelled", paymentStatus: "refunded", date: "2026-09-15T09:00:00" }),
  makeRequest({ id: "c", reference: "SR-3", mechanicId: null, mechanicName: "Yaw", status: "in_progress", date: "2026-09-20T09:00:00" }),
  makeRequest({ id: "d", reference: "SR-4", mechanicId: null, mechanicName: null, status: "requested", date: null }),
];

const filter = (overrides: Partial<typeof defaultServiceRequestFilters>) =>
  filterServiceRequests(requests, { ...defaultServiceRequestFilters, ...overrides }).map((request) => request.id);

describe("filterServiceRequests", () => {
  it("returns every request newest first by default, with undated records last", () => {
    expect(filter({})).toEqual(["c", "b", "a", "d"]);
    expect(filter({ sort: "oldest" })).toEqual(["a", "b", "c", "d"]);
  });

  it("searches ID, customer, mechanic, service, and humanised status", () => {
    expect(filter({ search: "sr-2" })).toEqual(["b"]);
    expect(filter({ search: "ama" })).toEqual(["a"]);
    expect(filter({ search: "in progress" })).toEqual(["c"]);
  });

  it("filters by status, payment status, and mechanic", () => {
    expect(filter({ status: "cancelled" })).toEqual(["b"]);
    expect(filter({ paymentStatus: "refunded" })).toEqual(["b"]);
    expect(filter({ mechanic: "mech-1" })).toEqual(["b", "a"]);
    expect(filter({ mechanic: "name:Yaw" })).toEqual(["c"]);
  });

  it("applies inclusive local date bounds and excludes undated records", () => {
    expect(filter({ from: "2026-09-15", to: "2026-09-20" })).toEqual(["c", "b"]);
    expect(filter({ to: "2026-09-01" })).toEqual(["a"]);
  });

  it("combines filters", () => {
    expect(filter({ mechanic: "mech-1", status: "completed", from: "2026-09-01" })).toEqual(["a"]);
  });
});

describe("isWithinDateRange", () => {
  it("includes the whole of the end day", () => {
    expect(isWithinDateRange("2026-09-20T23:59:00", "", "2026-09-20")).toBe(true);
    expect(isWithinDateRange("2026-09-21T00:00:01", "", "2026-09-20")).toBe(false);
  });

  it("matches everything, including undated records, when unbounded", () => {
    expect(isWithinDateRange(null, "", "")).toBe(true);
  });
});

describe("getMechanicKey", () => {
  it("prefers the backend id and falls back to the name", () => {
    expect(getMechanicKey({ mechanicId: "m1", mechanicName: "Kofi" })).toBe("m1");
    expect(getMechanicKey({ mechanicId: null, mechanicName: "Kofi" })).toBe("name:Kofi");
    expect(getMechanicKey({ mechanicId: null, mechanicName: null })).toBeNull();
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 23 }, (_, index) => index);

  it("slices the requested page", () => {
    expect(paginate(items, 3, 10)).toEqual({ items: [20, 21, 22], page: 3, totalPages: 3 });
  });

  it("clamps out-of-range pages, e.g. after filters shrink the result", () => {
    expect(paginate(items, 9, 10).page).toBe(3);
    expect(paginate([], 4, 10)).toEqual({ items: [], page: 1, totalPages: 1 });
  });
});

describe("URL state", () => {
  it("round-trips filters and page through search params", () => {
    const filters = {
      ...defaultServiceRequestFilters,
      search: "brake",
      status: "completed",
      mechanic: "mech-1",
      paymentStatus: "paid",
      from: "2026-09-01",
      to: "2026-09-30",
      sort: "oldest" as const,
    };
    const params = buildServiceRequestSearchParams(filters, 2);

    expect(parseServiceRequestFilters(params)).toEqual(filters);
    expect(parsePageParam(params)).toBe(2);
  });

  it("omits defaults and ignores malformed values", () => {
    expect(buildServiceRequestSearchParams(defaultServiceRequestFilters).toString()).toBe("");

    const params = new URLSearchParams("from=yesterday&sort=sideways&page=-3");
    expect(parseServiceRequestFilters(params)).toMatchObject({ from: "", sort: "newest" });
    expect(parsePageParam(params)).toBe(1);
  });

  it("builds history and detail links", () => {
    expect(buildServiceRequestHistoryHref({ status: "cancelled", mechanic: "m1" })).toBe(
      "/requests?status=cancelled&mechanic=m1",
    );
    expect(buildServiceRequestHistoryHref({})).toBe("/requests");
    expect(getServiceRequestHref({ id: "a/b" })).toBe("/requests/a%2Fb");
  });
});

describe("getDistinctOptions", () => {
  it("builds options only from values present in the records", () => {
    const options = getDistinctOptions(requests, (request) => request.status, (_request, value) => value);
    expect(options.map((option) => option.value)).toEqual(["cancelled", "completed", "in_progress", "requested"]);
  });
});
