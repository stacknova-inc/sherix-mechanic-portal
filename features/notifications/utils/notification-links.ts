import type { AppNotification } from "@/types/notification";

export interface NotificationLink {
  href: string;
  label: string;
}

/**
 * Backend record ids are opaque tokens (e.g. Mongo ObjectIds). Anything else in
 * a notification payload is ignored rather than interpolated into a route.
 */
const SAFE_RECORD_ID = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Only these payload keys produce links, and only to existing internal routes.
 * URLs supplied in the payload are never followed. The destination pages still
 * enforce access: they read company-scoped APIs, so a record outside the
 * company renders as "not found" instead of being exposed.
 *
 * The notification `data` schema is not documented by the backend; these keys
 * mirror the Service Request and employee id fields used elsewhere in this app.
 */
const LINK_RULES: Array<{
  keys: string[];
  label: string;
  toHref: (id: string) => string;
}> = [
  {
    keys: ["serviceRequestId", "bookingId", "requestId", "jobId"],
    label: "View Service Request",
    toHref: (id) => `/requests/${encodeURIComponent(id)}`,
  },
  {
    keys: ["employeeId", "mechanicId"],
    label: "View mechanic",
    toHref: (id) => `/employee/${encodeURIComponent(id)}`,
  },
];

function readSafeId(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && SAFE_RECORD_ID.test(value) ? value : null;
}

export function getNotificationLink(
  notification: Pick<AppNotification, "data">,
): NotificationLink | null {
  const data = notification.data;

  if (!data || typeof data !== "object") {
    return null;
  }

  for (const rule of LINK_RULES) {
    for (const key of rule.keys) {
      const id = readSafeId(data, key);
      if (id) {
        return { href: rule.toHref(id), label: rule.label };
      }
    }
  }

  return null;
}
