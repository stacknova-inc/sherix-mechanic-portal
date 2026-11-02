import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import {
  createEmployee,
  deactivateEmployee,
  reactivateEmployee,
  updateEmployee,
} from "@/features/dashboard/services/employee-service";
import type { EmployeeFormValues } from "@/features/dashboard/types/employee";
import { getCompanyIssues } from "@/services/issues-service";

const values: EmployeeFormValues = {
  name: " Richard Agyei ",
  phoneNumber: "+233551461921",
  email: "richard@example.com",
  dateOfBirth: "1986-09-28",
  levelOfExperience: "5-10 years",
  serviceIds: ["svc1"],
  issueIds: ["iss1", "iss2"],
  profilePhoto: null,
};

const backendEmployee = {
  _id: "emp1",
  name: "Richard Agyei",
  services: [{ _id: "svc1", name: "Battery" }],
  issues: [{ _id: "iss1", issueTitle: "Dead battery" }, "iss2"],
  isActive: true,
};

function sentFormData(mock: ReturnType<typeof vi.fn>) {
  return mock.mock.calls[0][1] as FormData;
}

describe("employee service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an employee with repeated services and issues fields", async () => {
    api.post.mockResolvedValue({ data: { data: backendEmployee } });
    const photo = new File(["x"], "photo.png", { type: "image/png" });

    const employee = await createEmployee({ ...values, profilePhoto: { 0: photo, length: 1 } as unknown as FileList });
    const body = sentFormData(api.post);

    expect(api.post.mock.calls[0][0]).toBe("/employees");
    expect(body.get("name")).toBe("Richard Agyei");
    expect(body.getAll("services")).toEqual(["svc1"]);
    expect(body.getAll("issues")).toEqual(["iss1", "iss2"]);
    expect(body.get("profilePhoto")).toBe(photo);
    expect(employee.issues).toEqual([
      { id: "iss1", name: "Dead battery" },
      { id: "iss2", name: "iss2" },
    ]);
  });

  it("updates without a photo unless a new one is chosen", async () => {
    api.put.mockResolvedValue({ data: backendEmployee });

    await updateEmployee("emp1", values);
    const body = sentFormData(api.put);

    expect(api.put.mock.calls[0][0]).toBe("/employees/emp1");
    expect(body.getAll("issues")).toEqual(["iss1", "iss2"]);
    expect(body.has("profilePhoto")).toBe(false);
  });

  it("deactivates and reactivates with PATCH", async () => {
    api.patch.mockResolvedValue({ data: { data: { ...backendEmployee, isActive: false, status: "suspended" } } });

    await expect(deactivateEmployee("emp1")).resolves.toMatchObject({ status: "SUSPENDED" });
    expect(api.patch).toHaveBeenCalledWith("/employees/emp1/deactivate");

    api.patch.mockResolvedValue({ data: { data: backendEmployee } });
    await expect(reactivateEmployee("emp1")).resolves.toMatchObject({ status: "ACTIVE" });
    expect(api.patch).toHaveBeenCalledWith("/employees/emp1/reactivate");
  });
});

describe("getCompanyIssues", () => {
  it("reads GET /issues/company and keeps each issue's service", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { _id: "iss1", issueTitle: "Dead battery", service: { _id: "svc1", name: "Battery" } },
          { _id: "iss2", title: "Flat tyre", service: "svc2" },
          { _id: "iss3", issueTitle: "Retired", isActive: false },
          { issueTitle: "No id" },
        ],
      },
    });

    await expect(getCompanyIssues()).resolves.toEqual([
      { id: "iss1", name: "Dead battery", serviceId: "svc1" },
      { id: "iss2", name: "Flat tyre", serviceId: "svc2" },
    ]);
    expect(api.get).toHaveBeenCalledWith("/issues/company");
  });
});
