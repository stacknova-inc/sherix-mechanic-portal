import { describe, expect, it } from "vitest";
import { getNotificationCategory } from "@/features/notifications/utils/notification-categories";

const category = (type: string, title = "") => getNotificationCategory({ type, title });

describe("getNotificationCategory", () => {
  it("maps each supported event type", () => {
    expect(category("service_request_assigned")).toBe("assignment");
    expect(category("company_verification_approved")).toBe("verification");
    expect(category("payout_completed")).toBe("payout");
    expect(category("booking_cancelled")).toBe("cancellation");
    expect(category("dispute_opened")).toBe("dispute");
    expect(category("mechanic_went_offline")).toBe("mechanic_status");
    expect(category("announcement")).toBe("announcement");
  });

  it("prefers the more specific category when keywords overlap", () => {
    expect(category("booking_cancelled")).toBe("cancellation");
    expect(category("dispute_payout_hold")).toBe("dispute");
  });

  it("falls back to the title, then to other", () => {
    expect(category("general", "Your payout has been sent")).toBe("payout");
    expect(category("general", "Welcome to Sherix")).toBe("other");
  });
});
