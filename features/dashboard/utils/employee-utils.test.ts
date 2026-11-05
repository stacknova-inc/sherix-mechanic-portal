import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import type { Employee, PaginatedEmployees } from "@/features/dashboard/types/employee";
import { removeEmployeeFromCaches, updateEmployeeInCaches } from "@/features/dashboard/utils/employee-cache";
import { getAvailableIssues, pruneIssueIds } from "@/features/dashboard/utils/employee-issues";

const employee = { id: "emp1", fullName: "Kofi", status: "ACTIVE" } as Employee;
const issues = [
  { id: "i1", name: "Dead battery", serviceId: "battery" },
  { id: "i2", name: "Flat tyre", serviceId: "tyres" },
  { id: "i3", name: "General inspection", serviceId: null },
];

describe("employee caches", () => {
  it("updates list and detail entries without breaking either shape", () => {
    const client = new QueryClient();
    const list: PaginatedEmployees = { employees: [employee], total: 1, page: 1, limit: 10, totalPages: 1 };
    client.setQueryData(["employees", { page: 1 }], list);
    client.setQueryData(["employees", "detail", "emp1"], employee);

    updateEmployeeInCaches(client, "emp1", (item) => ({ ...item, status: "SUSPENDED" }));

    expect(client.getQueryData<PaginatedEmployees>(["employees", { page: 1 }])?.employees[0].status).toBe("SUSPENDED");
    expect(client.getQueryData<Employee>(["employees", "detail", "emp1"])?.status).toBe("SUSPENDED");
  });

  it("removes an employee from lists only", () => {
    const client = new QueryClient();
    client.setQueryData(["employees", { page: 1 }], { employees: [employee], total: 1, page: 1, limit: 10, totalPages: 1 });
    client.setQueryData(["employees", "detail", "emp1"], employee);

    removeEmployeeFromCaches(client, "emp1");

    expect(client.getQueryData<PaginatedEmployees>(["employees", { page: 1 }])).toMatchObject({ employees: [], total: 0 });
    expect(client.getQueryData(["employees", "detail", "emp1"])).toBe(employee);
  });
});

describe("employee issues", () => {
  it("offers issues for the selected services plus service-independent ones", () => {
    expect(getAvailableIssues(issues, ["battery"]).map((issue) => issue.id)).toEqual(["i1", "i3"]);
    expect(getAvailableIssues(issues, [])).toEqual([]);
  });

  it("drops selected issues when their service is removed", () => {
    expect(pruneIssueIds(["i1", "i2", "i3"], issues, ["tyres"])).toEqual(["i2", "i3"]);
  });
});
