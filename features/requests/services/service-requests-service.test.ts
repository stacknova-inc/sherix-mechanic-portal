import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import {
  getCompanyServiceRequestStats,
  getCompanyServiceRequests,
  getReassignableCompanyMechanics,
  assignCompanyServiceRequestMechanic,
  normalizeCompanyServiceRequest,
  normalizeServiceRequestStats,
} from "@/features/requests/services/service-requests-service";

describe("normalizeCompanyServiceRequest", () => {
  it("maps a populated service request record", () => {
    expect(
      normalizeCompanyServiceRequest({
        _id: "sr1",
        jobId: "JOB-1001",
        status: "mechanic_accepted",
        customerId: { _id: "c1", fullName: "Ama Mensah" },
        mechanicId: { _id: "m1", name: "Kofi Boateng" },
        serviceId: { _id: "s1", name: "Battery replacement" },
        customerAddress: "East Legon, Accra",
        finalCost: 350,
        currency: "ghs",
        isPaid: true,
        createdAt: "2026-09-20T10:00:00.000Z",
        updatedAt: "2026-09-20T12:00:00.000Z",
      }),
    ).toEqual({
      id: "sr1",
      reference: "JOB-1001",
      status: "mechanic_accepted",
      customerName: "Ama Mensah",
      mechanicId: "m1",
      mechanicName: "Kofi Boateng",
      serviceName: "Battery replacement",
      location: "East Legon, Accra",
      paymentStatus: "paid",
      amount: 350,
      currency: "GHS",
      date: "2026-09-20T10:00:00.000Z",
      createdAt: "2026-09-20T10:00:00.000Z",
      updatedAt: "2026-09-20T12:00:00.000Z",
    });
  });

  it("treats unpopulated refs as ids, never as names", () => {
    const request = normalizeCompanyServiceRequest({
      _id: "sr2",
      mechanicId: "m9",
      customerId: "c9",
      originalIssueTitle: "Car won't start",
      status: "Canceled",
    });

    expect(request).toMatchObject({
      reference: "sr2",
      mechanicId: "m9",
      mechanicName: null,
      customerName: null,
      serviceName: "Car won't start",
      status: "cancelled",
      paymentStatus: null,
      amount: null,
      date: null,
    });
  });

  it("drops records without an id", () => {
    expect(normalizeCompanyServiceRequest({ jobId: "JOB-1" })).toBeNull();
  });
});

describe("getCompanyServiceRequests", () => {
  beforeEach(() => api.get.mockReset());

  it("requests one server-paginated page using the active filters", async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { serviceRequests: [{ _id: "a" }], pagination: { total: 22, page: 2, limit: 20, pages: 2 } } } });

    const result = await getCompanyServiceRequests({ search: " plate ", status: "requested", mechanic: "m-1", paymentStatus: "paid", from: "2026-09-01", to: "2026-09-30", sort: "newest" }, 2);

    expect(result).toMatchObject({ requests: [{ id: "a" }], total: 22, page: 2, limit: 20, pages: 2 });
    expect(api.get).toHaveBeenCalledWith("/service-requests/company-admin/list", { params: expect.any(URLSearchParams) });
    const params = api.get.mock.calls[0][1].params as URLSearchParams;
    expect(Object.fromEntries(params.entries())).toEqual({
      status: "requested",
      search: "plate",
      mechanic: "m-1",
      paymentStatus: "paid",
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
      latitude: "",
      longitude: "",
      radiusKm: "50",
      page: "2",
      limit: "20",
      sortBy: "",
    });
  });

  it("fails clearly when the list response is malformed", async () => {
    api.get.mockResolvedValue({ data: { data: { serviceRequests: [{ _id: "x" }] } } });

    await expect(getCompanyServiceRequests({}, 1)).rejects.toThrow("expected format");
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});

describe("service request stats", () => {
  it("uses statistic names for cards and ignores value/change field labels", () => {
    expect(
      normalizeServiceRequestStats({
        success: true,
        data: {
          totalRequests: { value: 42, change: 8 },
          opened: { value: 12, change: -2 },
          completed: 30,
          byStatus: { in_progress: 5, cancelled: 7 },
          reassigned: { value: 4, change: 1 },
          label: "ignored",
          list: [1],
        },
      }),
    ).toEqual([
      { key: "totalRequests", label: "All Service Requests", value: 42 },
      { key: "opened", label: "Opened Service Requests", value: 12 },
      { key: "completed", label: "Completed Service Requests", value: 30 },
      { key: "byStatus.in_progress", label: "In progress Service Requests", value: 5 },
      { key: "byStatus.cancelled", label: "Cancelled Service Requests", value: 7 },
      { key: "reassigned", label: "Reassigned Service Requests", value: 4 },
    ]);
  });

  it("reads GET /service-requests/company-admin/stats", async () => {
    api.get.mockResolvedValue({ data: { data: { total: 3 } } });

    await expect(getCompanyServiceRequestStats()).resolves.toEqual([{ key: "total", label: "All Service Requests", value: 3 }]);
    expect(api.get).toHaveBeenCalledWith("/service-requests/company-admin/stats", { params: expect.any(URLSearchParams) });
  });
});

describe("mechanic reassignment endpoints", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
  });

  it("loads only eligible mechanics for the selected Service Request", async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { mechanics: [{ _id: "mechanic/1", fullName: "Ama Mechanic" }] } } });
    await expect(getReassignableCompanyMechanics("request/1")).resolves.toEqual([
      { id: "mechanic/1", name: "Ama Mechanic" },
    ]);
    expect(api.get).toHaveBeenCalledWith("service-requests/company-admin/request%2F1/reassignable-mechanics");
  });

  it("posts the selected mechanic and reason to the assign endpoint", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    await assignCompanyServiceRequestMechanic("request/1", "mechanic/1", "Coverage change");
    expect(api.post).toHaveBeenCalledWith("service-requests/company-admin/request%2F1/reassign", {
      mechanicId: "mechanic/1",
      reason: "Coverage change",
    });
  });
});
