import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { RequestsTable } from "@/features/requests/components/RequestsTable";
import type { CompanyServiceRequest } from "@/features/requests/types";

const request: CompanyServiceRequest = {
  id: "65f1a2b3c4d5e6f708192a3b",
  reference: "SR-1001",
  status: "completed",
  customerName: "Ama Mensah",
  mechanicId: "mech-1",
  mechanicName: "Kofi Boateng",
  serviceName: "Battery replacement",
  location: "Accra",
  paymentStatus: "paid",
  amount: 350,
  currency: "GHS",
  date: "2026-09-20T10:00:00",
  createdAt: null,
  updatedAt: null,
};

function renderTable(overrides: Partial<React.ComponentProps<typeof RequestsTable>> = {}) {
  const props: React.ComponentProps<typeof RequestsTable> = {
    requests: [request],
    isLoading: false,
    error: null,
    hasAnyRequests: true,
    hasActiveFilters: false,
    page: 1,
    totalPages: 3,
    totalMatching: 25,
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    onClearFilters: vi.fn(),
    onReassign: vi.fn(),
    ...overrides,
  };

  render(<RequestsTable {...props} />);
  return props;
}

function httpError(status: number) {
  return new AxiosError("Request failed", "ERR", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { message: status === 403 ? "Forbidden" : "Server exploded" },
  });
}

describe("RequestsTable", () => {
  it("shows the Service Request, parties, status, payment status, and currency-labelled amount", () => {
    renderTable();
    const table = screen.getByRole("table");

    expect(within(table).getByRole("link", { name: "Open Service Request SR-1001" })).toHaveAttribute(
      "href",
      "/requests/65f1a2b3c4d5e6f708192a3b",
    );
    expect(within(table).getByText("Ama Mensah")).toBeInTheDocument();
    expect(within(table).getByText("Kofi Boateng")).toBeInTheDocument();
    expect(within(table).getByText("Completed")).toBeInTheDocument();
    expect(within(table).getByText("Paid")).toBeInTheDocument();
    expect(within(table).getByText(/GHS\s350\.00/)).toBeInTheDocument();
  });

  it("announces loading without rendering stale rows", () => {
    renderTable({ isLoading: true });

    expect(screen.getByRole("status")).toHaveTextContent("Loading Service Requests");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("distinguishes 'no data yet' from 'no matches for these filters'", () => {
    renderTable({ requests: [], hasAnyRequests: false, totalMatching: 0 });
    expect(screen.getByText("No Service Requests yet")).toBeInTheDocument();
  });

  it("offers to clear filters when filters hide every result", async () => {
    const props = renderTable({ requests: [], hasActiveFilters: true, totalMatching: 0 });

    expect(screen.getByText("No Service Requests match these filters")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear search and filters" }));
    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it("shows a retryable error", async () => {
    const props = renderTable({ error: httpError(500) });

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load Service Requests");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it("shows a permission state for 403 without a pointless retry", () => {
    renderTable({ error: httpError(403) });

    expect(screen.getByRole("alert")).toHaveTextContent("You don't have permission to view Service Requests");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("paginates", async () => {
    const props = renderTable({ page: 2 });
    const pagination = screen.getByRole("navigation", { name: "Service Request pages" });

    expect(pagination).toHaveTextContent("Page 2 of 3");
    await userEvent.click(within(pagination).getByRole("button", { name: /Next/ }));
    expect(props.onPageChange).toHaveBeenCalledWith(3);
    await userEvent.click(within(pagination).getByRole("button", { name: /Previous/ }));
    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it("provides View and Reassign actions for each Service Request", async () => {
    const props = renderTable();
    const table = screen.getByRole("table");
    expect(within(table).queryByRole("link", { name: "View Service Request" })).not.toBeInTheDocument();
    await userEvent.click(within(table).getByRole("button", { name: "Actions for Service Request SR-1001" }));
    expect(within(table).getByRole("menuitem", { name: "View Service Request" })).toHaveAttribute(
      "href",
      "/requests/65f1a2b3c4d5e6f708192a3b",
    );
    await userEvent.click(within(table).getByRole("menuitem", { name: "Reassign" }));
    expect(props.onReassign).toHaveBeenCalledWith(request);
  });

  it("disables page navigation at the boundaries", () => {
    renderTable({ page: 1, totalPages: 1, totalMatching: 1 });
    const pagination = screen.getByRole("navigation", { name: "Service Request pages" });

    expect(within(pagination).getByRole("button", { name: /Previous/ })).toBeDisabled();
    expect(within(pagination).getByRole("button", { name: /Next/ })).toBeDisabled();
  });
});
