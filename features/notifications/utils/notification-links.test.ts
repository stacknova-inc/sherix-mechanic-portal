import { describe, expect, it } from "vitest";
import { getNotificationLink } from "@/features/notifications/utils/notification-links";

describe("getNotificationLink", () => {
  it("links Service Request notifications to the company-scoped detail page", () => {
    expect(getNotificationLink({ data: { bookingId: "65f1a2b3c4d5e6f708192a3b" } })).toEqual({
      href: "/requests/65f1a2b3c4d5e6f708192a3b",
      label: "View Service Request",
    });
    expect(getNotificationLink({ data: { serviceRequestId: "SR-1001" } })?.href).toBe("/requests/SR-1001");
  });

  it("links mechanic notifications to the employee page", () => {
    expect(getNotificationLink({ data: { employeeId: "emp_42" } })).toEqual({
      href: "/employee/emp_42",
      label: "View mechanic",
    });
  });

  it("returns no link when the notification has no associated record", () => {
    expect(getNotificationLink({ data: null })).toBeNull();
    expect(getNotificationLink({ data: undefined })).toBeNull();
    expect(getNotificationLink({ data: { message: "Welcome to Sherix" } })).toBeNull();
  });

  it("never follows URLs or unsafe ids from the payload", () => {
    expect(getNotificationLink({ data: { url: "https://evil.example/phish" } })).toBeNull();
    expect(getNotificationLink({ data: { link: "/requests/123" } })).toBeNull();
    expect(getNotificationLink({ data: { bookingId: "../../settings" } })).toBeNull();
    expect(getNotificationLink({ data: { bookingId: "javascript:alert(1)" } })).toBeNull();
    expect(getNotificationLink({ data: { bookingId: "a?b=c" } })).toBeNull();
    expect(getNotificationLink({ data: { bookingId: 42 } })).toBeNull();
    expect(getNotificationLink({ data: { bookingId: "x".repeat(65) } })).toBeNull();
  });
});
