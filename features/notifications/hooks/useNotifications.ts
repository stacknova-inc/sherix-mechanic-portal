"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import { useAuthStore } from "@/store/auth-store";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/services/notification-service";
import type { PaginatedNotifications } from "@/types/notification";

export const notificationsQueryKey = ["notifications"] as const;

function setReadInCache(
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

export function useNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasHydrated, token } = useAuthStore();
  const canFetchNotifications = hasHydrated && Boolean(token);

  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => getNotifications(),
    enabled: canFetchNotifications,
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: (_data, notificationId) => {
      queryClient.setQueryData<PaginatedNotifications>(notificationsQueryKey, (currentData) =>
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
      queryClient.setQueryData<PaginatedNotifications>(
        notificationsQueryKey,
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
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    refetchNotifications: notificationsQuery.refetch,
  };
}
