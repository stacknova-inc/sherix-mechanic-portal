"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { getNotificationLink } from "@/features/notifications/utils/notification-links";
import {
  getNotificationCategory,
  getNotificationCategoryLabel,
} from "@/features/notifications/utils/notification-categories";
import { formatDateTime } from "@/lib/date-format";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/utils/cn";

const MESSAGE_PREVIEW_LIMIT = 140;

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (notificationId: string) => void;
  isMarking?: boolean;
}

function getInitials(notification: AppNotification) {
  const source = notification.title || notification.message || "?";
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const actionClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red";

export function NotificationItem({ notification, onMarkAsRead, isMarking = false }: NotificationItemProps) {
  const titleId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const link = getNotificationLink(notification);
  const isLongMessage = notification.message.length > MESSAGE_PREVIEW_LIMIT;
  const eventLabel = getNotificationCategoryLabel(getNotificationCategory(notification));

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "relative flex gap-3 px-5 py-4 sm:px-7",
        !notification.isRead && "bg-[#fff8f9] dark:bg-brand-red/[0.06]",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white",
          notification.isRead ? "bg-[#a5b0b8]" : "bg-[#111827]",
        )}
      >
        {getInitials(notification)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={titleId} className="text-[13px] font-extrabold leading-5 text-[#252932] dark:text-white">
            {notification.title || eventLabel}
          </h2>
          <span className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-bold text-[#687386] dark:bg-white/10 dark:text-white/70">
            {eventLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
              notification.isRead
                ? "text-[#8f96a3]"
                : "bg-brand-red text-white",
            )}
          >
            {notification.isRead ? "Read" : "Unread"}
          </span>
        </div>

        {notification.message ? (
          <p
            className={cn(
              "mt-0.5 text-[12px] font-medium leading-5 text-[#3e4651] dark:text-white/70",
              !isExpanded && isLongMessage && "line-clamp-2",
            )}
          >
            {notification.message}
          </p>
        ) : null}

        {isLongMessage ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-1 inline-flex items-center gap-1 rounded text-[11px] font-bold text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            {isExpanded ? "Show less" : "Show more"}
            <ChevronDown className={cn("size-3 transition", isExpanded && "rotate-180")} aria-hidden="true" />
          </button>
        ) : null}

        <p className="mt-1 text-[10px] font-bold text-[#9aa1ac]">
          <time dateTime={notification.createdAt}>{formatDateTime(notification.createdAt)}</time>
        </p>

        {link || !notification.isRead ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {link ? (
              <Link
                href={link.href}
                onClick={() => {
                  if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                  }
                }}
                className={cn(actionClassName, "bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark")}
              >
                {link.label}
              </Link>
            ) : null}
            {!notification.isRead ? (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarking}
                aria-label={`Mark as read: ${notification.title || eventLabel}`}
                className={cn(actionClassName, "border border-[#e5e8ee] text-[#4b535f] hover:border-brand-red hover:text-brand-red disabled:opacity-60 dark:border-white/10 dark:text-white/80")}
              >
                {isMarking ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-3.5" aria-hidden="true" />
                )}
                Mark as read
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
