import type { AppNotification } from "@/types/notification";

export type NotificationCategory =
  | "assignment"
  | "verification"
  | "payout"
  | "cancellation"
  | "dispute"
  | "mechanic_status"
  | "announcement"
  | "other";

export const NOTIFICATION_CATEGORIES: Array<{ value: NotificationCategory; label: string }> = [
  { value: "assignment", label: "Assignments" },
  { value: "verification", label: "Verification" },
  { value: "payout", label: "Payouts" },
  { value: "cancellation", label: "Cancellations" },
  { value: "dispute", label: "Disputes" },
  { value: "mechanic_status", label: "Mechanic status" },
  { value: "announcement", label: "Announcements" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  assignment: "Assignment",
  verification: "Verification",
  payout: "Payout",
  cancellation: "Cancellation",
  dispute: "Dispute",
  mechanic_status: "Mechanic status",
  announcement: "Announcement",
  other: "Update",
};

/** Checked in order; the first match wins (e.g. "booking_cancelled" is a cancellation, not an assignment). */
const KEYWORDS: Array<[NotificationCategory, string[]]> = [
  ["dispute", ["dispute"]],
  ["cancellation", ["cancel"]],
  ["payout", ["payout", "payment", "settle", "withdraw"]],
  ["verification", ["verif", "kyc", "compliance", "document"]],
  ["assignment", ["assign", "booking", "service_request", "request", "job"]],
  ["mechanic_status", ["mechanic", "employee", "online", "offline", "suspend", "reactivat"]],
  ["announcement", ["announce", "broadcast", "promo", "news"]],
];

function match(text: string): NotificationCategory | null {
  const normalized = text.toLowerCase();
  return KEYWORDS.find(([, words]) => words.some((word) => normalized.includes(word)))?.[0] ?? null;
}

/**
 * Maps a backend notification to a UI category. The backend `type` values are
 * undocumented, so the type is matched first and the title is a fallback.
 * TODO: replace with a documented `category` field once the backend provides one.
 */
export function getNotificationCategory(notification: Pick<AppNotification, "type" | "title">): NotificationCategory {
  return match(notification.type) ?? match(notification.title) ?? "other";
}

export function getNotificationCategoryLabel(category: NotificationCategory) {
  return CATEGORY_LABELS[category];
}
