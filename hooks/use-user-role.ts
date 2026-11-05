"use client";

import { useSyncExternalStore } from "react";
import { COMPANY_ADMIN_ROLE, normalizeRole, useAuthStore } from "@/store/auth-store";

export type CompanyUserRole = "admin" | "staff";

/**
 * Company roles as the UI understands them. Today the backend only issues
 * `company_admin`; any other company role is treated as `staff` (least access).
 *
 * TODO: connect to backend — expected: the session/user payload (e.g. GET /auth/me)
 * returns the company role plus explicit permissions, e.g.
 * { role: "company_admin" | "company_staff", permissions: ["payouts:configure", ...] }.
 */
export function toCompanyUserRole(role: string | null | undefined): CompanyUserRole {
  return normalizeRole(role) === COMPANY_ADMIN_ROLE ? "admin" : "staff";
}

const ROLE_OVERRIDE_PARAM = "role";

function readDevRoleOverride(): CompanyUserRole | null {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return null;
  }

  const value = new URLSearchParams(window.location.search).get(ROLE_OVERRIDE_PARAM);
  return value === "admin" || value === "staff" ? value : null;
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * Current user's company role. In development only, `?role=staff` or `?role=admin`
 * previews another role's UI. This is a UI convenience: the backend must still
 * authorize every request.
 */
export function useUserRole(): CompanyUserRole {
  const authRole = useAuthStore((state) => state.user?.role);
  const override = useSyncExternalStore(subscribeToLocation, readDevRoleOverride, () => null);

  return override ?? toCompanyUserRole(authRole);
}

export const PERMISSIONS = {
  viewFinancials: ["admin", "staff"],
  configurePayouts: ["admin"],
  respondToDisputes: ["admin"],
} as const satisfies Record<string, readonly CompanyUserRole[]>;

export type CompanyPermission = keyof typeof PERMISSIONS;

export function hasPermission(role: CompanyUserRole, permission: CompanyPermission): boolean {
  return (PERMISSIONS[permission] as readonly CompanyUserRole[]).includes(role);
}
