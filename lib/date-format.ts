const NOT_AVAILABLE = "Not available";

function toValidDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string {
  const date = toValidDate(value);

  return date
    ? new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date)
    : NOT_AVAILABLE;
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toValidDate(value);

  return date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
    : NOT_AVAILABLE;
}
