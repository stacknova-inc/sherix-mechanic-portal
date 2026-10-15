import { beforeAll, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";

const failSend = vi.hoisted(() => ({ current: false }));

vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);
vi.mock("@/features/support/services/support-chat-service", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/support/services/support-chat-service")>();
  return {
    ...original,
    sendSupportMessage: async (...args: Parameters<typeof original.sendSupportMessage>) => {
      if (failSend.current) {
        throw new Error("offline");
      }
      return original.sendSupportMessage(...args);
    },
  };
});

import { SupportChat } from "@/features/support/components/SupportChat";

beforeAll(() => {
  // jsdom has no layout; scrolling is a no-op.
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => 0 });
});

describe("SupportChat", () => {
  it("renders the conversation thread as a live log", async () => {
    renderWithProviders(<SupportChat />);
    const log = await screen.findByRole("log", { name: "Support conversation" });

    expect(within(log).getByText(/payout still shows as processing/)).toBeInTheDocument();
    expect(within(log).getAllByText(/Selasi \(Sherix Support\)/).length).toBeGreaterThan(0);
  });

  it("sends with Enter, keeps Shift+Enter for new lines, and blocks empty messages", async () => {
    failSend.current = false;
    renderWithProviders(<SupportChat />);
    const input = await screen.findByLabelText("Message to support");
    const send = screen.getByRole("button", { name: "Send message" });

    expect(send).toBeDisabled();
    await userEvent.type(input, "Line one{Shift>}{Enter}{/Shift}Line two");
    expect(input).toHaveValue("Line one\nLine two");

    await userEvent.type(input, "{Enter}");
    expect(input).toHaveValue("");

    const log = screen.getByRole("log");
    await waitFor(() => expect(within(log).getByText(/Line one\s+Line two/)).toBeInTheDocument());
    await waitFor(() => expect(within(log).queryByText("Sending…")).not.toBeInTheDocument());
  });

  it("marks failed messages and offers retry and discard", async () => {
    failSend.current = true;
    renderWithProviders(<SupportChat />);
    const input = await screen.findByLabelText("Message to support");

    await userEvent.type(input, "Is anyone there?{Enter}");

    expect(await screen.findByText("Not sent.")).toBeInTheDocument();
    failSend.current = false;
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByText("Not sent.")).not.toBeInTheDocument());
    expect(within(screen.getByRole("log")).getAllByText("Is anyone there?")).toHaveLength(1);
  });
});
