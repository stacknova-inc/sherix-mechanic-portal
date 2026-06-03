"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { getApiErrorDetails } from "@/services/api-error";

function shouldRetryQuery(failureCount: number, error: unknown) {
  const details = getApiErrorDetails(error);

  if (
    details.status === 401 ||
    details.status === 403 ||
    details.reason === "invalid_api_endpoint"
  ) {
    return false;
  }

  return failureCount < 1;
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: shouldRetryQuery,
            staleTime: 30_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
