import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal(), "company_admin"),
);

import { hasPermission, toCompanyUserRole, useUserRole } from "@/hooks/use-user-role";

describe("toCompanyUserRole", () => {
  it("maps the backend company admin role to admin in any spelling", () => {
    expect(toCompanyUserRole("company_admin")).toBe("admin");
    expect(toCompanyUserRole("Company-Admin")).toBe("admin");
  });

  it("treats every other or missing role as staff (least access)", () => {
    expect(toCompanyUserRole("company_staff")).toBe("staff");
    expect(toCompanyUserRole(undefined)).toBe("staff");
  });
});

describe("hasPermission", () => {
  it("lets only admins configure payouts and respond to disputes", () => {
    expect(hasPermission("admin", "configurePayouts")).toBe(true);
    expect(hasPermission("staff", "configurePayouts")).toBe(false);
    expect(hasPermission("staff", "respondToDisputes")).toBe(false);
    expect(hasPermission("staff", "viewFinancials")).toBe(true);
  });
});

describe("useUserRole", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("derives the role from the signed-in user", () => {
    const { result } = renderHook(() => useUserRole());
    expect(result.current).toBe("admin");
  });

  it("supports a development-only ?role= preview override", () => {
    window.history.replaceState(null, "", "/earnings?role=staff");
    const { result } = renderHook(() => useUserRole());
    expect(result.current).toBe("staff");
  });

  it("ignores unknown override values", () => {
    window.history.replaceState(null, "", "/earnings?role=superuser");
    const { result } = renderHook(() => useUserRole());
    expect(result.current).toBe("admin");
  });
});
