import type * as AuthStoreModule from "@/store/auth-store";

/**
 * Module factory for `vi.mock("@/store/auth-store", ...)`: a hydrated, signed-in
 * session with the given backend role. Keeps the real role helpers. Pass the
 * real module from `importOriginal` (importing it here would deadlock the mock).
 *
 *   vi.mock("@/store/auth-store", async (importOriginal) =>
 *     (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()));
 */
export function createAuthStoreModule(actual: typeof AuthStoreModule, role = "company_admin") {
  const state = {
    hasHydrated: true,
    token: "test-token",
    user: { name: "Test Admin", email: "admin@example.com", role },
  };

  return {
    ...actual,
    useAuthStore: <T,>(selector?: (value: typeof state) => T) => (selector ? selector(state) : state),
  };
}
