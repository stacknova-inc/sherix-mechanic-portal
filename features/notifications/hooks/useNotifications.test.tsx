import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import type { AppNotification, PaginatedNotifications } from "@/types/notification";

const service = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));
vi.mock("@/features/notifications/services/notification-service", () => service);
vi.mock("@/store/auth-store", () => ({
  useAuthStore: () => ({ hasHydrated: true, token: "token" }),
}));

import { useNotifications } from "@/features/notifications/hooks/useNotifications";

function notification(id: string, isRead = false): AppNotification {
  return { id, title: id, message: "", type: "general", isRead, createdAt: "2026-09-20T10:00:00.000Z" };
}

function pageOf(page: number, notifications: AppNotification[]): PaginatedNotifications {
  return { notifications, total: 25, page, limit: 20, totalPages: 2, unreadCount: 3 };
}

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getNotifications.mockImplementation(({ page }: { page: number }) =>
      Promise.resolve(pageOf(page, page === 1 ? [notification("a"), notification("b", true)] : [notification("c")])),
    );
    service.markNotificationAsRead.mockResolvedValue(undefined);
  });

  it("requests the given page from the server and exposes pagination", async () => {
    const { result, rerender } = renderHookWithProviders(
      ({ page }: { page: number }) => useNotifications({ page, limit: 20 }),
      { initialProps: { page: 1 } },
    );

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(service.getNotifications).toHaveBeenLastCalledWith({ page: 1, limit: 20 });
    expect(result.current).toMatchObject({ page: 1, totalPages: 2, total: 25, unreadCount: 3 });

    rerender({ page: 2 });
    await waitFor(() => expect(result.current.notifications.map((item) => item.id)).toEqual(["c"]));
    expect(service.getNotifications).toHaveBeenLastCalledWith({ page: 2, limit: 20 });
  });

  it("marks a notification read and updates the unread count", async () => {
    const { result } = renderHookWithProviders(() => useNotifications({ page: 1, limit: 20 }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => result.current.markAsRead("a"));

    await waitFor(() => expect(result.current.notifications[0].isRead).toBe(true));
    expect(service.markNotificationAsRead).toHaveBeenCalledWith("a");
    expect(result.current.unreadCount).toBe(2);
  });

  it("keeps unread state when marking as read fails", async () => {
    service.markNotificationAsRead.mockRejectedValue(new Error("offline"));
    const { result } = renderHookWithProviders(() => useNotifications({ page: 1, limit: 20 }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));

    act(() => result.current.markAsRead("a"));

    await waitFor(() => expect(service.markNotificationAsRead).toHaveBeenCalled());
    expect(result.current.notifications[0].isRead).toBe(false);
    expect(result.current.unreadCount).toBe(3);
  });

  it("surfaces load errors", async () => {
    service.getNotifications.mockRejectedValue(new Error("boom"));
    const { result } = renderHookWithProviders(() => useNotifications({ page: 1, limit: 20 }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.notifications).toEqual([]);
  });
});
