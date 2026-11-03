import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/http-client", () => ({ apiClient: api }));

import {
  getPayoutSettings,
  normalizeImpactPreview,
  previewPayoutSettings,
  updatePayoutSettings,
} from "@/features/payout-settings/services/payout-settings-service";

const documentedResponse = {
  success: true,
  message: "Payout settings retrieved",
  data: {
    policy: {
      settlementEnabled: true,
      settlementPeriodDays: 7,
      minPayoutAmount: 10,
      splits: [
        { label: "Mechanic", entity: "mechanic", percent: 70 },
        { label: "Company", entity: "company", percent: 30 },
      ],
    },
    platform: { entity: "platform", percent: 20, basis: "job_gross", editable: false, source: "commissions.mechanicServicePercent" },
    version: 1,
    effectiveFrom: "2026-09-22T18:01:00.131Z",
    source: "Company Override",
    isOverride: true,
  },
};

const policy = {
  settlementEnabled: true,
  settlementPeriodDays: 7,
  minPayoutAmount: 50,
  splits: [
    { label: "Mechanic", entity: "mechanic", percent: 90 },
    { label: "Company", entity: "company", percent: 10 },
  ],
};

describe("payout settings service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads GET /companies/payout-settings as documented", async () => {
    api.get.mockResolvedValue({ data: documentedResponse });

    await expect(getPayoutSettings()).resolves.toEqual({
      policy: documentedResponse.data.policy,
      platform: { entity: "platform", percent: 20, basis: "job_gross", editable: false, source: "commissions.mechanicServicePercent" },
      version: 1,
      effectiveFrom: "2026-09-22T18:01:00.131Z",
      source: "Company Override",
      isOverride: true,
    });
    expect(api.get).toHaveBeenCalledWith("/companies/payout-settings");
  });

  it("posts only the policy to the impact preview", async () => {
    api.post.mockResolvedValue({ data: { success: true, data: { effectiveFrom: "2026-10-01T00:00:00Z", affectedMechanics: 4 } } });

    await expect(previewPayoutSettings(policy)).resolves.toEqual({
      effectiveFrom: "2026-10-01T00:00:00Z",
      entries: [{ label: "Affected mechanics", value: "4" }],
    });
    expect(api.post).toHaveBeenCalledWith("/companies/payout-settings/impact-preview", policy);
  });

  it("saves with expectedVersion and reason", async () => {
    api.patch.mockResolvedValue({ data: { success: true } });
    const input = { ...policy, expectedVersion: 1, reason: "Company retains 10%" };

    await updatePayoutSettings(input);

    expect(api.patch).toHaveBeenCalledWith("/companies/payout-settings", input);
  });
});

describe("normalizeImpactPreview", () => {
  it("flattens nested values into labelled rows", () => {
    expect(
      normalizeImpactPreview({
        data: { summary: { pendingPayouts: 12, estimatedChange: -30.5 }, recalculatesSettled: false },
      }),
    ).toEqual({
      effectiveFrom: null,
      entries: [
        { label: "Summary pending payouts", value: "12" },
        { label: "Summary estimated change", value: "-30.5" },
        { label: "Recalculates settled", value: "No" },
      ],
    });
  });
});
