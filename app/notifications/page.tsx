"use client";

import { useState } from "react";
import { Bell, Check, Expand, Loader2, Search, Shrink } from "lucide-react";
import { PaginationControls } from "@/features/dashboard/components/PaginationControls";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  NOTIFICATION_CATEGORIES,
  getNotificationCategory,
  type NotificationCategory,
} from "@/features/notifications/utils/notification-categories";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/utils/cn";

const NOTIFICATIONS_PAGE_SIZE = 20;

function matchesSearch(notification: AppNotification, query: string) {
  if (!query) {
    return true;
  }

  return [notification.title, notification.message, notification.type]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const {
    notifications,
    unreadCount,
    totalPages,
    total,
    isLoading,
    isFetching,
    isPlaceholderData,
    isError,
    error,
    markAsRead,
    markingId,
    markAllAsRead,
    isMarkingAllAsRead,
    refetchNotifications,
  } = useNotifications({ page, limit: NOTIFICATIONS_PAGE_SIZE });
  const [searchTerm, setSearchTerm] = useState("");
  // TODO: connect to backend — expected: GET /notifications accepts `category` so the filter
  // spans every page. Until then it filters the page that is loaded.
  const [category, setCategory] = useState<NotificationCategory | "">("");
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredNotifications = notifications.filter(
    (notification) =>
      matchesSearch(notification, normalizedQuery) &&
      (!category || getNotificationCategory(notification) === category),
  );

  return (
    <DashboardShell>
      <section className="flex min-h-[720px] items-start">
        <div
          className={cn(
            "w-full overflow-hidden rounded-[8px] bg-white shadow-[0_24px_80px_rgba(23,25,31,0.22)] ring-1 ring-black/5 dark:bg-[#1b1d22] dark:ring-white/10",
            isPanelExpanded ? "max-w-none" : "max-w-[690px]",
          )}
        >
          <header className="flex h-[74px] items-center border-b border-[#eef0f3] px-5 dark:border-white/10 sm:px-7">
            <h1 className="text-[22px] font-extrabold tracking-normal text-[#252932] dark:text-white">
              Notifications
            </h1>
            <span className="ml-3 text-[12px] font-bold text-[#7d8490]" aria-live="polite">
              {unreadCount > 0 ? `${unreadCount.toLocaleString()} unread` : "All caught up"}
            </span>
            <button
              type="button"
              onClick={() => setIsPanelExpanded((current) => !current)}
              aria-label={
                isPanelExpanded
                  ? "Collapse notifications panel"
                  : "Expand notifications panel to full page"
              }
              className="ml-auto flex size-9 items-center justify-center rounded-full text-[#7d8490] transition hover:bg-[#f4f6f8] hover:text-[#252932] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              {isPanelExpanded ? (
                <Shrink className="size-4" aria-hidden="true" />
              ) : (
                <Expand className="size-4" aria-hidden="true" />
              )}
            </button>
          </header>

          <div className="flex flex-col gap-3 border-b border-[#f1f2f4] px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:px-7">
            <label htmlFor="notification-search" className="sr-only">
              Search notifications on this page
            </label>
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa1ac]"
                size={16}
                aria-hidden="true"
              />
              <input
                id="notification-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search this page..."
                className="w-full rounded-[6px] border border-[#e5e8ee] bg-white py-2 pl-9 pr-4 text-[13px] font-medium text-[#252932] focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <label htmlFor="notification-category" className="sr-only">
              Filter by notification type
            </label>
            <select
              id="notification-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as NotificationCategory | "")}
              className="h-10 rounded-[6px] border border-[#e5e8ee] bg-white px-3 text-[13px] font-semibold text-[#252932] focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">All types</option>
              {NOTIFICATION_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead || unreadCount === 0}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[6px] border border-[#e5e8ee] bg-white px-5 text-[12px] font-extrabold text-[#4b535f] shadow-[0_4px_14px_rgba(23,25,31,0.04)] transition hover:border-[#d6dbe3] hover:bg-[#f8f9fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              Mark all as read
            </button>
          </div>

          <div
            aria-busy={isFetching}
            className={cn(
              "overflow-y-auto divide-y divide-[#f3f5f7] dark:divide-white/10",
              isPanelExpanded ? "max-h-[calc(100vh-320px)]" : "max-h-[642px]",
              isPlaceholderData && "opacity-60",
            )}
          >
            {isLoading ? (
              <div
                role="status"
                className="flex items-center justify-center gap-2 px-5 py-10 text-[13px] font-semibold text-[#7d8490]"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading notifications...
              </div>
            ) : isError ? (
              <div className="p-5">
                <QueryErrorState
                  error={error}
                  subject="notifications"
                  onRetry={() => void refetchNotifications()}
                />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center text-[13px] font-semibold text-[#7d8490]">
                <Bell className="size-6 text-[#c4c9d2]" aria-hidden="true" />
                {notifications.length === 0
                  ? "You have no notifications yet. Updates about Service Requests, verification, and your mechanics will appear here."
                  : "No notifications on this page match your search or type filter."}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  isMarking={markingId === notification.id}
                />
              ))
            )}
          </div>

          {!isLoading && !isError && total > 0 ? (
            <PaginationControls
              label="Notification pages"
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setSearchTerm("");
              }}
              disabled={isPlaceholderData}
              summary={`${total.toLocaleString()} total`}
            />
          ) : null}
        </div>
      </section>
    </DashboardShell>
  );
}
