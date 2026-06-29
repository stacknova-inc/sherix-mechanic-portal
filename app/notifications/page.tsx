"use client";

import { useState } from "react";
import { Bell, Check, ChevronDown, Expand, Loader2, Search, Shrink } from "lucide-react";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/utils/cn";

const MESSAGE_PREVIEW_LIMIT = 140;

function formatNotificationDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function getNotificationInitials(notification: AppNotification) {
  const source = notification.title || notification.message || "?";
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
  const {
    notifications,
    isLoading,
    isError,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredNotifications = notifications.filter((notification) =>
    matchesSearch(notification, normalizedQuery),
  );

  return (
    <DashboardShell>
      <section className="flex min-h-[720px] items-start">
        <div
          className={cn(
            "w-full overflow-hidden rounded-[8px] bg-white shadow-[0_24px_80px_rgba(23,25,31,0.22)] ring-1 ring-black/5",
            isPanelExpanded ? "max-w-none" : "max-w-[690px]",
          )}
        >
          <header className="flex h-[74px] items-center border-b border-[#eef0f3] px-5 sm:px-7">
            <h1 className="text-[22px] font-extrabold tracking-normal text-[#252932]">
              Notifications
            </h1>
            <button
              type="button"
              onClick={() => setIsPanelExpanded((current) => !current)}
              aria-label={
                isPanelExpanded
                  ? "Collapse notifications panel"
                  : "Expand notifications panel to full page"
              }
              className="ml-auto flex size-9 items-center justify-center rounded-full text-[#7d8490] transition hover:bg-[#f4f6f8] hover:text-[#252932]"
            >
              {isPanelExpanded ? (
                <Shrink className="size-4" />
              ) : (
                <Expand className="size-4" />
              )}
            </button>
          </header>

          <div className="flex items-center gap-3 border-b border-[#f1f2f4] px-5 py-4 sm:px-7">
            <label className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa1ac]"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-[6px] border border-[#e5e8ee] bg-white py-2 pl-9 pr-4 text-[13px] font-medium text-[#252932] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </label>
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#e5e8ee] bg-white px-5 text-[12px] font-extrabold text-[#4b535f] shadow-[0_4px_14px_rgba(23,25,31,0.04)] transition hover:border-[#d6dbe3] hover:bg-[#f8f9fb] disabled:opacity-60"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Mark As Read
            </button>
          </div>

          <div
            className={cn(
              "overflow-y-auto",
              isPanelExpanded ? "max-h-[calc(100vh-260px)]" : "max-h-[642px]",
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-5 py-10 text-[13px] font-semibold text-[#7d8490]">
                <Loader2 className="size-4 animate-spin" />
                Loading notifications...
              </div>
            ) : isError ? (
              <div className="m-5 rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : "Unable to load notifications. Please try again."}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center text-[13px] font-semibold text-[#7d8490]">
                <Bell className="size-6 text-[#c4c9d2]" />
                {notifications.length === 0
                  ? "You have no notifications yet."
                  : "No notifications match your search."}
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const { date, time } = formatNotificationDate(notification.createdAt);
                const isExpanded = expandedId === notification.id;
                const isLongMessage =
                  notification.message.length > MESSAGE_PREVIEW_LIMIT;

                return (
                  <article
                    key={notification.id}
                    onClick={() => {
                      if (!notification.isRead) {
                        void markAsRead(notification.id);
                      }
                    }}
                    className="group relative flex gap-3 px-5 py-4 transition hover:bg-[#fbfcfd] sm:px-7 cursor-pointer"
                  >
                    <div
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                        notification.isRead
                          ? "bg-[#a5b0b8] text-white"
                          : "bg-[#111827] text-white"
                      }`}
                    >
                      {getNotificationInitials(notification)}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <p className="text-[13px] font-semibold leading-5 text-[#707783]">
                        <span className="font-extrabold text-[#252932]">
                          {notification.title}
                        </span>
                      </p>
                      {notification.message ? (
                        <p
                          className={cn(
                            "mt-0.5 text-[12px] font-medium leading-5 text-[#3e4651]",
                            !isExpanded && isLongMessage && "line-clamp-2",
                          )}
                        >
                          {notification.message}
                        </p>
                      ) : null}
                      {isLongMessage ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedId((current) =>
                              current === notification.id ? null : notification.id,
                            );
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-brand-red"
                        >
                          {isExpanded ? "Show less" : "Show more"}
                          <ChevronDown
                            className={cn(
                              "size-3 transition",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      ) : null}
                      <p className="mt-1 text-[10px] font-bold text-[#9aa1ac]">
                        {date} • {time}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <span className="absolute right-7 top-7 size-2.5 rounded-full bg-brand-red" />
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
