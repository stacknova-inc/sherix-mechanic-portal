import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import { ToastProvider } from "@/hooks/use-toast";

export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60 * 1000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

function Providers({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  client: QueryClient = makeTestQueryClient(),
  options?: RenderOptions,
) {
  return { client, ...render(<Providers client={client}>{ui}</Providers>, options) };
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: { initialProps?: TProps; client?: QueryClient } = {},
) {
  const client = options.client ?? makeTestQueryClient();

  return {
    client,
    ...renderHook(hook, {
      initialProps: options.initialProps,
      wrapper: ({ children }) => <Providers client={client}>{children}</Providers>,
    }),
  };
}
