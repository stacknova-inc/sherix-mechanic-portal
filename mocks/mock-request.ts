/**
 * Stand-in for `apiClient` calls while a feature is UI-only.
 *
 * Every mock service function calls `mockRequest(scope, () => data)` in place of
 * `apiClient.get(...)`. Wiring the real endpoint means replacing that one call.
 *
 * - Simulates network latency so loading states render as they will in production.
 * - Returns a deep copy so callers can never mutate the shared mock store.
 * - Outside production, append `?mockError=<scope>` (or `?mockError=all`) to any
 *   URL to force that scope's requests to fail and preview error states.
 */
const MOCK_LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 450;

export type MockScope =
  | "earnings"
  | "payout-settings"
  | "performance"
  | "service-request-extras"
  | "disputes"
  | "support";

function shouldSimulateFailure(scope: MockScope) {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return false;
  }

  const requested = new URLSearchParams(window.location.search).get("mockError");
  return requested === "all" || requested?.split(",").includes(scope) === true;
}

function wait(ms: number) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

export async function mockRequest<T>(
  scope: MockScope,
  produce: () => T,
  latencyMs = MOCK_LATENCY_MS,
): Promise<T> {
  await wait(latencyMs);

  if (shouldSimulateFailure(scope)) {
    throw new Error(`Simulated ${scope} failure (remove ?mockError from the URL to restore sample data).`);
  }

  return structuredClone(produce());
}

export interface MockPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Mirrors the `{ data, pagination }` envelope already used by other Sherix list endpoints. */
export function paginateMock<T>(items: T[], page = 1, limit = 10): { data: T[]; pagination: MockPagination } {
  const pages = Math.max(1, Math.ceil(items.length / limit));
  const current = Math.min(Math.max(1, page), pages);

  return {
    data: items.slice((current - 1) * limit, current * limit),
    pagination: { total: items.length, page: current, limit, pages },
  };
}
