"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import { useAuthStore } from "@/store/auth-store";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/services/notification-service";
import type { NotificationListParams, PaginatedNotifications } from "@/types/notification";

export const notificationsQueryKey = ["notifications"] as const;

/** Shared by the header menu and sidebar badge so both read one cached request. */
export const NOTIFICATION_PREVIEW_PARAMS: NotificationListParams = { page: 1, limit: 6 };

export const notificationsPageQueryKey = (params: NotificationListParams) =>
  [...notificationsQueryKey, params] as const;

export function setReadInCache(
  currentData: PaginatedNotifications | undefined,
  notificationId: string,
): PaginatedNotifications | undefined {
  if (!currentData) {
    return currentData;
  }

  const notification = currentData.notifications.find((item) => item.id === notificationId);
  if (!notification || notification.isRead) {
    return currentData;
  }

  return {
    ...currentData,
    notifications: currentData.notifications.map((item) =>
      item.id === notificationId ? { ...item, isRead: true } : item,
    ),
    unreadCount: Math.max(0, currentData.unreadCount - 1),
  };
}

export function useNotifications(params: NotificationListParams = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasHydrated, token } = useAuthStore();
  const canFetchNotifications = hasHydrated && Boolean(token);

  const notificationsQuery = useQuery({
    queryKey: notificationsPageQueryKey(params),
    queryFn: () => getNotifications(params),
    enabled: canFetchNotifications,
    placeholderData: keepPreviousData,
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  // Read state is shared by every cached page (and the header badge).
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: (_data, notificationId) => {
      queryClient.setQueriesData<PaginatedNotifications>({ queryKey: notificationsQueryKey }, (currentData) =>
        setReadInCache(currentData, notificationId),
      );
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationsQueryKey },
        (currentData) =>
          currentData && {
            ...currentData,
            notifications: currentData.notifications.map((item) => ({ ...item, isRead: true })),
            unreadCount: 0,
          },
      );
      toast({ type: "success", message: "All notifications marked as read." });
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });

  return {
    notifications,
    unreadCount,
    page: notificationsQuery.data?.page ?? params.page ?? 1,
    totalPages: notificationsQuery.data?.totalPages ?? 1,
    total: notificationsQuery.data?.total ?? 0,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    isPlaceholderData: notificationsQuery.isPlaceholderData,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    markAsRead: markAsReadMutation.mutate,
    markingId: markAsReadMutation.isPending ? markAsReadMutation.variables : undefined,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    refetchNotifications: notificationsQuery.refetch,
  };
}
