import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SupportChannels } from "@/features/support/components/SupportChannels";
import { SUPPORT_PLACEHOLDERS, resolveSupportContact } from "@/services/support-config";

describe("SupportChannels", () => {
  it("links configured phone and email destinations with tel: and mailto:", () => {
    render(<SupportChannels email="help@example.com" phone="+1 (555) 010-0199" />);

    expect(screen.getByRole("link", { name: /Call Sherix support on \+1 \(555\) 010-0199/ })).toHaveAttribute(
      "href",
      "tel:+15550100199",
    );
    expect(screen.getByRole("link", { name: /Email Sherix support at help@example.com/ })).toHaveAttribute(
      "href",
      "mailto:help@example.com",
    );
    expect(screen.queryByText("Sample data")).not.toBeInTheDocument();
  });

  it("explains invalid configuration instead of inventing contacts", () => {
    render(<SupportChannels email="not-an-email" phone="call us" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Call support" })).getByText(/has not been configured/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Email support" })).getByText(/has not been configured/)).toBeInTheDocument();
  });

  it("labels placeholder contacts used while the env vars are unset", () => {
    const email = resolveSupportContact(undefined, SUPPORT_PLACEHOLDERS.email);
    const phone = resolveSupportContact("  ", SUPPORT_PLACEHOLDERS.phone);
    render(
      <SupportChannels
        email={email.value}
        phone={phone.value}
        emailIsPlaceholder={email.isPlaceholder}
        phoneIsPlaceholder={phone.isPlaceholder}
      />,
    );

    expect(screen.getByRole("link", { name: /support@example.com/ })).toHaveAttribute("href", "mailto:support@example.com");
    expect(screen.getByRole("link", { name: /\+1 555 0100/ })).toHaveAttribute("href", "tel:+15550100");
    expect(screen.getAllByText("Sample data")).toHaveLength(2);
    expect(screen.getAllByText(/Placeholder shown until the official contact is configured/)).toHaveLength(2);
  });

  it("prefers configured values over placeholders", () => {
    expect(resolveSupportContact("help@sherix.test", SUPPORT_PLACEHOLDERS.email)).toEqual({
      value: "help@sherix.test",
      isPlaceholder: false,
    });
  });
});
