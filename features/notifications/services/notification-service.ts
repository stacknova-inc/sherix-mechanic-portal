import { apiClient } from "@/services/http-client";
import type {
  AppNotification,
  NotificationListParams,
  PaginatedNotifications,
} from "@/types/notification";

type BackendNotification = {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  body?: string;
  content?: string;
  type?: string;
  category?: string;
  isRead?: boolean;
  read?: boolean;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
  data?: Record<string, unknown> | null;
};

type BackendNotificationsContainer = {
  notifications?: BackendNotification[];
  docs?: BackendNotification[];
  results?: BackendNotification[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  unreadCount?: number;
  unread_count?: number;
};

type BackendNotificationsResponse =
  | BackendNotification[]
  | (BackendNotificationsContainer & {
      data?: BackendNotification[] | BackendNotificationsContainer;
    });

function normalizeNotification(notification: BackendNotification): AppNotification {
  const isRead =
    notification.isRead ??
    notification.read ??
    Boolean(notification.readAt ?? notification.read_at);

  return {
    id: notification._id ?? notification.id ?? "",
    title: notification.title ?? "",
    message: notification.message ?? notification.body ?? notification.content ?? "",
    type: notification.type ?? notification.category ?? "general",
    isRead,
    createdAt: notification.createdAt ?? notification.created_at ?? new Date().toISOString(),
    data: notification.data ?? null,
  };
}

function normalizeNotificationsResponse(
  response: BackendNotificationsResponse,
  fallbackParams?: NotificationListParams,
): PaginatedNotifications {
  const container = Array.isArray(response) ? undefined : response;
  const dataContainer =
    !Array.isArray(response) && !Array.isArray(response.data) ? response.data : undefined;

  const rawNotifications = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : dataContainer?.notifications ??
        dataContainer?.docs ??
        dataContainer?.results ??
        container?.notifications ??
        container?.docs ??
        container?.results ??
        [];

  const notifications = rawNotifications.map(normalizeNotification);
  const total = dataContainer?.total ?? container?.total ?? notifications.length;
  const page = dataContainer?.page ?? container?.page ?? fallbackParams?.page ?? 1;
  const limit =
    dataContainer?.limit ?? container?.limit ?? fallbackParams?.limit ?? notifications.length;
  const unreadCount =
    dataContainer?.unreadCount ??
    dataContainer?.unread_count ??
    container?.unreadCount ??
    container?.unread_count ??
    notifications.filter((notification) => !notification.isRead).length;

  return {
    notifications,
    total,
    page,
    limit,
    totalPages:
      dataContainer?.totalPages ??
      container?.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(limit, 1))),
    unreadCount,
  };
}

export async function getNotifications(
  params: NotificationListParams = {},
): Promise<PaginatedNotifications> {
  const response = await apiClient.get<BackendNotificationsResponse>("notifications", {
    params: {
      page: params.page,
      limit: params.limit,
    },
  });

  return normalizeNotificationsResponse(response.data, params);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}
