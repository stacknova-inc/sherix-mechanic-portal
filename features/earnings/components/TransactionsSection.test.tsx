import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);

import { TransactionsSection } from "@/features/earnings/components/TransactionsSection";

describe("TransactionsSection", () => {
  it("expands a row to show its commission breakdown", async () => {
    renderWithProviders(<TransactionsSection />);
    const table = await screen.findByRole("table");
    const toggle = within(table).getAllByRole("button", { name: /Show commission breakdown/ })[0];

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const breakdown = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(breakdown).toHaveTextContent("Sherix platform commission (15%)");
    expect(breakdown).toHaveTextContent("Mechanic payout");
    expect(breakdown).toHaveTextContent("Company share");
  });

  it("filters by status and can be cleared", async () => {
    renderWithProviders(<TransactionsSection />);
    await screen.findByRole("table");

    await userEvent.selectOptions(screen.getByLabelText("Status"), "failed");
    await waitFor(() => {
      const statuses = within(screen.getByRole("table")).getAllByText(/^(Completed|Pending|Failed|Refunded)$/);
      expect(statuses.every((cell) => cell.textContent === "Failed")).toBe(true);
    });

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByLabelText("Status")).toHaveValue("");
  });

  it("shows an empty state when nothing matches the date range", async () => {
    renderWithProviders(<TransactionsSection />);
    await screen.findByRole("table");

    await userEvent.type(screen.getByLabelText("From date"), "2001-01-01");
    await userEvent.type(screen.getByLabelText("To date"), "2001-01-31");

    expect(await screen.findByText("No transactions match these filters")).toBeInTheDocument();
  });
});
