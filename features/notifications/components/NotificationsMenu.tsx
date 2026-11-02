"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import {
  NOTIFICATION_PREVIEW_PARAMS,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import {
  getNotificationCategory,
  getNotificationCategoryLabel,
} from "@/features/notifications/utils/notification-categories";
import { getNotificationLink } from "@/features/notifications/utils/notification-links";
import { formatDateTime } from "@/lib/date-format";
import { cn } from "@/utils/cn";

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

/** Header bell: unread badge plus a panel with the latest notifications. */
export function NotificationsMenu() {
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetchNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications(NOTIFICATION_PREVIEW_PARAMS);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        onClick={() => setOpen((current) => !current)}
        className="relative flex size-9 items-center justify-center rounded-full border border-[#eef0f3] bg-white text-[#6f7784] transition hover:border-brand-red hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/70"
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-extrabold text-white"
          >
            {formatBadgeCount(unreadCount)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Latest notifications"
          className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-xl bg-white shadow-[0_18px_45px_rgba(17,24,39,0.16)] ring-1 ring-black/5 dark:bg-[#202329] dark:ring-white/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-[#f0f2f5] px-4 py-3 dark:border-white/10">
            <p className="text-sm font-extrabold text-brand-dark dark:text-white">
              Notifications{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </p>
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0 || isMarkingAllAsRead}
              className="inline-flex items-center gap-1 rounded text-xs font-extrabold text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-40"
            >
              {isMarkingAllAsRead ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : <Check className="size-3" aria-hidden="true" />}
              Mark all as read
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <p role="status" className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#7d8490]">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading notifications…
              </p>
            ) : isError ? (
              <div role="alert" className="px-4 py-6 text-center text-sm text-[#6f7784]">
                Couldn&apos;t load notifications.{" "}
                <button type="button" onClick={() => void refetchNotifications()} className="font-extrabold text-brand-red underline-offset-4 hover:underline">
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#7d8490]">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-[#f3f5f7] dark:divide-white/10">
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const category = getNotificationCategoryLabel(getNotificationCategory(notification));

                  return (
                    <li key={notification.id} className={cn("px-4 py-3", !notification.isRead && "bg-[#fff8f9] dark:bg-brand-red/[0.06]")}>
                      <div className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className={cn("mt-1.5 size-2 shrink-0 rounded-full", notification.isRead ? "bg-transparent" : "bg-brand-red")}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-extrabold text-brand-dark dark:text-white">
                            <span className="sr-only">{notification.isRead ? "Read: " : "Unread: "}</span>
                            {notification.title || category}
                          </p>
                          {notification.message ? (
                            <p className="line-clamp-2 text-xs text-[#596170] dark:text-white/65">{notification.message}</p>
                          ) : null}
                          <p className="mt-1 text-[10px] font-bold text-[#9aa1ac]">
                            {category} · <time dateTime={notification.createdAt}>{formatDateTime(notification.createdAt)}</time>
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-extrabold">
                            {link ? (
                              <Link
                                href={link.href}
                                onClick={() => {
                                  if (!notification.isRead) markAsRead(notification.id);
                                  setOpen(false);
                                }}
                                className="rounded text-brand-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white"
                              >
                                {link.label}
                              </Link>
                            ) : null}
                            {!notification.isRead ? (
                              <button
                                type="button"
                                onClick={() => markAsRead(notification.id)}
                                aria-label={`Mark as read: ${notification.title || category}`}
                                className="rounded text-[#6f7784] underline-offset-4 hover:text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                              >
                                Mark as read
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#f0f2f5] px-4 py-3 text-center text-xs font-extrabold text-brand-red transition hover:bg-[#fbfcfd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-red dark:border-white/10 dark:hover:bg-white/5"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
