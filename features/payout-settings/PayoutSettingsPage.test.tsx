import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import type { PayoutSettings } from "@/features/payout-settings/types";

const role = vi.hoisted(() => ({ current: "admin" as "admin" | "staff" }));
const service = vi.hoisted(() => ({
  getPayoutSettings: vi.fn(),
  previewPayoutSettings: vi.fn(),
  updatePayoutSettings: vi.fn(),
}));

vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);
vi.mock("@/features/dashboard/layouts/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/hooks/use-user-role", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/use-user-role")>()),
  useUserRole: () => role.current,
}));
vi.mock("@/features/payout-settings/services/payout-settings-service", () => service);

import { PayoutSettingsPage } from "@/features/payout-settings/PayoutSettingsPage";

const settings: PayoutSettings = {
  policy: {
    settlementEnabled: true,
    settlementPeriodDays: 7,
    minPayoutAmount: 50,
    splits: [
      { label: "Mechanic", entity: "mechanic", percent: 95 },
      { label: "Company", entity: "company", percent: 5 },
    ],
  },
  platform: { entity: "platform", percent: 20, basis: "job_gross", editable: false, source: "commissions.mechanicServicePercent" },
  version: 1,
  effectiveFrom: "2026-09-22T18:01:00.131Z",
  source: "Company Override",
  isOverride: true,
};

describe("PayoutSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    role.current = "admin";
    service.getPayoutSettings.mockResolvedValue(settings);
    service.previewPayoutSettings.mockResolvedValue({ effectiveFrom: "2026-10-01T00:00:00Z", entries: [{ label: "Affected mechanics", value: "4" }] });
    service.updatePayoutSettings.mockResolvedValue(undefined);
  });

  it("denies staff and never requests the settings", () => {
    role.current = "staff";
    renderWithProviders(<PayoutSettingsPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Only company admins can change payout settings");
    expect(service.getPayoutSettings).not.toHaveBeenCalled();
  });

  it("shows the current policy and the read-only platform commission", async () => {
    renderWithProviders(<PayoutSettingsPage />);

    expect(await screen.findByLabelText("Mechanic share")).toHaveValue("95");
    expect(screen.getByLabelText("Company share")).toHaveValue("5");
    expect(screen.getByText("20% platform commission")).toBeInTheDocument();
    expect(screen.getByText(/which companies can't change/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview impact" })).toBeDisabled();
  });

  it("requires a reason before previewing", async () => {
    renderWithProviders(<PayoutSettingsPage />);
    const mechanic = await screen.findByLabelText("Mechanic share");

    await userEvent.clear(mechanic);
    await userEvent.type(mechanic, "90");
    await userEvent.click(screen.getByRole("button", { name: "Preview impact" }));

    expect(screen.getByLabelText("Reason for change")).toHaveAttribute("aria-invalid", "true");
    expect(service.previewPayoutSettings).not.toHaveBeenCalled();
  });

  it("previews the change, then saves it with the expected version", async () => {
    renderWithProviders(<PayoutSettingsPage />);
    const mechanic = await screen.findByLabelText("Mechanic share");

    await userEvent.clear(mechanic);
    await userEvent.type(mechanic, "90");
    expect(screen.getByLabelText("Company share")).toHaveValue("10");
    await userEvent.type(screen.getByLabelText("Reason for change"), "Company retains 10%");
    await userEvent.click(screen.getByRole("button", { name: "Preview impact" }));

    expect(await screen.findByText("Review payout changes")).toBeInTheDocument();
    expect(service.previewPayoutSettings).toHaveBeenCalledWith({
      settlementEnabled: true,
      settlementPeriodDays: 7,
      minPayoutAmount: 50,
      splits: [
        { label: "Mechanic", entity: "mechanic", percent: 90 },
        { label: "Company", entity: "company", percent: 10 },
      ],
    });
    expect(screen.getByText("Settled payouts will not change.")).toBeInTheDocument();
    expect(screen.getByText("Affected mechanics")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Confirm and save" }));

    await waitFor(() =>
      expect(service.updatePayoutSettings).toHaveBeenCalledWith(
        expect.objectContaining({ expectedVersion: 1, reason: "Company retains 10%" }),
      ),
    );
    expect(await screen.findByText("Payout settings saved.")).toBeInTheDocument();
  });

  it("shows preview failures without leaving the form", async () => {
    service.previewPayoutSettings.mockRejectedValue(new Error("Not found"));
    renderWithProviders(<PayoutSettingsPage />);
    const period = await screen.findByLabelText("Settlement period (days)");

    await userEvent.clear(period);
    await userEvent.type(period, "14");
    await userEvent.type(screen.getByLabelText("Reason for change"), "Pay every two weeks");
    await userEvent.click(screen.getByRole("button", { name: "Preview impact" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't preview the change: Not found");
    expect(screen.getByLabelText("Settlement period (days)")).toHaveValue("14");
  });
});
