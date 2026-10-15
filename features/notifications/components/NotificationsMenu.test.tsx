import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import type { PaginatedNotifications } from "@/types/notification";

const service = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));
vi.mock("@/features/notifications/services/notification-service", () => service);
vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);

import { NotificationsMenu } from "@/features/notifications/components/NotificationsMenu";

const response: PaginatedNotifications = {
  notifications: [
    {
      id: "n1",
      title: "Payout sent",
      message: "Kofi's payout has been sent.",
      type: "payout_completed",
      isRead: false,
      createdAt: "2026-09-26T10:00:00.000Z",
      data: { employeeId: "emp_1" },
    },
    {
      id: "n2",
      title: "Dispute opened",
      message: "",
      type: "dispute_opened",
      isRead: true,
      createdAt: "2026-09-25T10:00:00.000Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 6,
  totalPages: 1,
  unreadCount: 1,
};

describe("NotificationsMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getNotifications.mockResolvedValue(structuredClone(response));
    service.markNotificationAsRead.mockResolvedValue(undefined);
  });

  it("shows the unread count on the bell", async () => {
    renderWithProviders(<NotificationsMenu />);
    expect(await screen.findByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();
  });

  it("opens a panel with read/unread state and types, and closes on Escape", async () => {
    renderWithProviders(<NotificationsMenu />);
    const bell = await screen.findByRole("button", { name: "Notifications, 1 unread" });

    await userEvent.click(bell);
    const panel = screen.getByRole("dialog", { name: "Latest notifications" });
    expect(bell).toHaveAttribute("aria-expanded", "true");
    expect(within(panel).getByText("Unread:", { exact: false })).toBeInTheDocument();
    expect(within(panel).getByText(/Payout ·/)).toBeInTheDocument();
    expect(within(panel).getByText(/Dispute ·/)).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "View mechanic" })).toHaveAttribute("href", "/employee/emp_1");

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(bell).toHaveFocus();
  });

  it("marks a notification read from the panel", async () => {
    renderWithProviders(<NotificationsMenu />);
    await userEvent.click(await screen.findByRole("button", { name: "Notifications, 1 unread" }));

    await userEvent.click(screen.getByRole("button", { name: "Mark as read: Payout sent" }));

    expect(service.markNotificationAsRead).toHaveBeenCalledWith("n1");
    await waitFor(() => expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument());
  });
});
