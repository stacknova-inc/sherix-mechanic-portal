import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import type { AppNotification } from "@/types/notification";

const baseNotification: AppNotification = {
  id: "n1",
  title: "New Service Request assigned",
  message: "Kofi has been assigned to SR-1001.",
  type: "service_request_assigned",
  isRead: false,
  createdAt: "2026-09-20T10:00:00.000Z",
  data: { bookingId: "65f1a2b3c4d5e6f708192a3b" },
};

describe("NotificationItem", () => {
  it("identifies the event and states unread status in text, not colour alone", () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "New Service Request assigned" })).toBeInTheDocument();
    expect(screen.getByText("Assignment")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
  });

  it("links to the associated record and marks the notification read on open", async () => {
    const onMarkAsRead = vi.fn();
    render(<NotificationItem notification={baseNotification} onMarkAsRead={onMarkAsRead} />);

    const link = screen.getByRole("link", { name: "View Service Request" });
    expect(link).toHaveAttribute("href", "/requests/65f1a2b3c4d5e6f708192a3b");

    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);
    expect(onMarkAsRead).toHaveBeenCalledWith("n1");
  });

  it("marks an unread notification as read from a keyboard-accessible button", async () => {
    const onMarkAsRead = vi.fn();
    render(<NotificationItem notification={baseNotification} onMarkAsRead={onMarkAsRead} />);

    screen.getByRole("button", { name: /Mark as read/ }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onMarkAsRead).toHaveBeenCalledWith("n1");
  });

  it("shows read notifications without read actions", () => {
    render(
      <NotificationItem notification={{ ...baseNotification, isRead: true }} onMarkAsRead={vi.fn()} />,
    );

    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mark as read/ })).not.toBeInTheDocument();
  });

  it("renders no link for notifications without a safe associated record", () => {
    render(
      <NotificationItem
        notification={{ ...baseNotification, type: "announcement", data: { url: "https://evil.example" } }}
        onMarkAsRead={vi.fn()}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
