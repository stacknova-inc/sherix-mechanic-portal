export const COMPLETED_STATUS = "completed";
export const CANCELLED_STATUS = "cancelled";

const CLOSED_STATUSES = new Set([COMPLETED_STATUS, CANCELLED_STATUS, "expired"]);
const AWAITING_MECHANIC_STATUSES = new Set(["requested", "pending"]);

/** Still in progress: not completed, cancelled, or expired. */
export function isOpenServiceRequest(status: string | null): boolean {
  return Boolean(status) && !CLOSED_STATUSES.has(status as string);
}

/** Waiting for a mechanic to accept. */
export function isAwaitingMechanic(status: string | null): boolean {
  return Boolean(status) && AWAITING_MECHANIC_STATUSES.has(status as string);
}

const STATUS_ALIASES: Record<string, string> = {
  canceled: CANCELLED_STATUS,
};

export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

const STATUS_TONES: Record<string, StatusTone> = {
  completed: "success",
  paid: "success",
  cancelled: "danger",
  rejected: "danger",
  failed: "danger",
  expired: "danger",
  disputed: "warning",
  pending: "warning",
  requested: "warning",
  unpaid: "warning",
  refunded: "neutral",
  processing: "info",
  open: "warning",
  under_review: "info",
  resolved: "success",
  on_hold: "warning",
  released: "success",
  withheld: "danger",
};

/** Normalises backend status spellings ("In Progress", "in-progress") to snake_case. */
export function normalizeStatusKey(status: string): string {
  const key = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return STATUS_ALIASES[key] ?? key;
}

/** "mechanic_accepted" -> "Mechanic accepted". Status is always shown as text, never colour alone. */
export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return "Not available";
  }

  const words = status.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function getStatusTone(status: string | null | undefined): StatusTone {
  if (!status) {
    return "neutral";
  }

  return STATUS_TONES[status] ?? "info";
}
