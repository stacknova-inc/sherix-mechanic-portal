import { describe, expect, it } from "vitest";
import type { PayoutSettings } from "@/features/payout-settings/types";
import {
  diffPolicies,
  draftFromSettings,
  draftToPolicy,
  hasErrors,
  isPolicyChanged,
  setSplitPercent,
  validateDraft,
} from "@/features/payout-settings/utils/payout-settings";

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
  platform: { percent: 20, basis: "job_gross", editable: false },
  version: 1,
  effectiveFrom: null,
  source: null,
  isOverride: true,
};

const validDraft = () => ({ ...draftFromSettings(settings), reason: "Adjust the company share" });

describe("validateDraft", () => {
  it("accepts the saved settings with a reason", () => {
    expect(hasErrors(validateDraft(validDraft()))).toBe(false);
  });

  it("requires a whole-day settlement period within range", () => {
    expect(validateDraft({ ...validDraft(), settlementPeriodDays: "0" }).settlementPeriodDays).toBeDefined();
    expect(validateDraft({ ...validDraft(), settlementPeriodDays: "7.5" }).settlementPeriodDays).toBeDefined();
    expect(validateDraft({ ...validDraft(), settlementPeriodDays: "366" }).settlementPeriodDays).toBeDefined();
  });

  it("requires a non-negative minimum payout with up to 2 decimals", () => {
    expect(validateDraft({ ...validDraft(), minPayoutAmount: "-1" }).minPayoutAmount).toBeDefined();
    expect(validateDraft({ ...validDraft(), minPayoutAmount: "10.005" }).minPayoutAmount).toBeDefined();
    expect(validateDraft({ ...validDraft(), minPayoutAmount: "0" }).minPayoutAmount).toBeUndefined();
  });

  it("requires the split to total exactly 100%", () => {
    const draft = validDraft();
    draft.splits = [
      { ...draft.splits[0], percent: "90" },
      { ...draft.splits[1], percent: "5" },
    ];
    expect(validateDraft(draft).splitTotal).toBe("The split must add up to 100% (currently 95%).");
  });

  it("requires a reason", () => {
    expect(validateDraft({ ...validDraft(), reason: " " }).reason).toBeDefined();
  });
});

describe("setSplitPercent", () => {
  it("keeps a two-way split at 100% by updating the other share", () => {
    const splits = validDraft().splits;
    expect(setSplitPercent(splits, 0, "87.5").map((split) => split.percent)).toEqual(["87.5", "12.5"]);
    expect(setSplitPercent(splits, 1, "10").map((split) => split.percent)).toEqual(["90", "10"]);
  });

  it("leaves the other share alone while the input is incomplete", () => {
    expect(setSplitPercent(validDraft().splits, 0, "").map((split) => split.percent)).toEqual(["", "5"]);
  });
});

describe("diffPolicies", () => {
  it("marks exactly the fields that change", () => {
    const proposed = draftToPolicy({ ...validDraft(), splits: setSplitPercent(validDraft().splits, 0, "90") });
    const changes = diffPolicies(settings.policy, proposed, (amount) => amount.toFixed(2));

    expect(changes.filter((change) => change.changed)).toEqual([
      { label: "Mechanic share", current: "95%", proposed: "90%", changed: true },
      { label: "Company share", current: "5%", proposed: "10%", changed: true },
    ]);
    expect(isPolicyChanged(settings.policy, proposed)).toBe(true);
    expect(isPolicyChanged(settings.policy, draftToPolicy(validDraft()))).toBe(false);
  });
});
