import { describe, expect, it } from "vitest";
import {
  getSupportEmailDestination,
  getSupportPhoneDestination,
} from "@/services/support-config";

describe("getSupportEmailDestination", () => {
  it("builds a mailto link from a configured address", () => {
    expect(getSupportEmailDestination(" help@example.com ")).toEqual({
      display: "help@example.com",
      href: "mailto:help@example.com",
    });
  });

  it("treats missing or malformed addresses as unavailable", () => {
    expect(getSupportEmailDestination(undefined)).toBeNull();
    expect(getSupportEmailDestination("")).toBeNull();
    expect(getSupportEmailDestination("not-an-email")).toBeNull();
    expect(getSupportEmailDestination("a@b.com?cc=x@y.com")).toBeNull();
    expect(getSupportEmailDestination("help@example.com?bcc=other.com")).toBeNull();
    expect(getSupportEmailDestination("javascript:alert(1)")).toBeNull();
  });
});

describe("getSupportPhoneDestination", () => {
  it("builds a dialable tel link while keeping the configured display format", () => {
    expect(getSupportPhoneDestination("+1 (555) 010-0199")).toEqual({
      display: "+1 (555) 010-0199",
      href: "tel:+15550100199",
    });
    expect(getSupportPhoneDestination("0555 010 019")?.href).toBe("tel:0555010019");
  });

  it("treats missing or malformed numbers as unavailable", () => {
    expect(getSupportPhoneDestination(undefined)).toBeNull();
    expect(getSupportPhoneDestination("   ")).toBeNull();
    expect(getSupportPhoneDestination("call us")).toBeNull();
    expect(getSupportPhoneDestination("12345")).toBeNull();
    expect(getSupportPhoneDestination("1".repeat(16))).toBeNull();
  });
});
