import type { PayoutPolicy, PayoutSettings } from "@/features/payout-settings/types";

export interface SplitDraft {
  label: string;
  entity: string;
  percent: string;
}

export interface PayoutSettingsDraft {
  settlementEnabled: boolean;
  settlementPeriodDays: string;
  minPayoutAmount: string;
  splits: SplitDraft[];
  reason: string;
}

export interface PayoutSettingsErrors {
  settlementPeriodDays?: string;
  minPayoutAmount?: string;
  splits: Record<number, string>;
  splitTotal?: string;
  reason?: string;
}

export const SETTLEMENT_PERIOD_RANGE = { min: 1, max: 365 };
export const REASON_LENGTH = { min: 5, max: 500 };

const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;

const toCents = (value: number) => Math.round(value * 100);

export function draftFromSettings(settings: PayoutSettings): PayoutSettingsDraft {
  return {
    settlementEnabled: settings.policy.settlementEnabled,
    settlementPeriodDays: String(settings.policy.settlementPeriodDays),
    minPayoutAmount: String(settings.policy.minPayoutAmount),
    splits: settings.policy.splits.map((split) => ({ ...split, percent: String(split.percent) })),
    reason: "",
  };
}

export function draftToPolicy(draft: PayoutSettingsDraft): PayoutPolicy {
  return {
    settlementEnabled: draft.settlementEnabled,
    settlementPeriodDays: Number(draft.settlementPeriodDays),
    minPayoutAmount: Number(draft.minPayoutAmount),
    splits: draft.splits.map((split) => ({ label: split.label, entity: split.entity, percent: Number(split.percent) })),
  };
}

function validatePercent(value: string): string | undefined {
  if (!DECIMAL_PATTERN.test(value.trim())) {
    return "Use a number with up to 2 decimal places.";
  }
  return Number(value) > 100 ? "Must be between 0 and 100." : undefined;
}

export function validateDraft(draft: PayoutSettingsDraft): PayoutSettingsErrors {
  const errors: PayoutSettingsErrors = { splits: {} };
  const period = draft.settlementPeriodDays.trim();

  if (
    !INTEGER_PATTERN.test(period) ||
    Number(period) < SETTLEMENT_PERIOD_RANGE.min ||
    Number(period) > SETTLEMENT_PERIOD_RANGE.max
  ) {
    errors.settlementPeriodDays = `Enter a whole number of days from ${SETTLEMENT_PERIOD_RANGE.min} to ${SETTLEMENT_PERIOD_RANGE.max}.`;
  }

  if (!DECIMAL_PATTERN.test(draft.minPayoutAmount.trim())) {
    errors.minPayoutAmount = "Enter an amount of 0 or more, with up to 2 decimal places.";
  }

  draft.splits.forEach((split, index) => {
    const error = validatePercent(split.percent);
    if (error) {
      errors.splits[index] = error;
    }
  });

  if (Object.keys(errors.splits).length === 0) {
    const total = draft.splits.reduce((sum, split) => sum + toCents(Number(split.percent)), 0);
    if (total !== 10_000) {
      errors.splitTotal = `The split must add up to 100% (currently ${total / 100}%).`;
    }
  }

  const reasonLength = draft.reason.trim().length;
  if (reasonLength < REASON_LENGTH.min || reasonLength > REASON_LENGTH.max) {
    errors.reason = `Explain the change in ${REASON_LENGTH.min}–${REASON_LENGTH.max} characters.`;
  }

  return errors;
}

export function hasErrors(errors: PayoutSettingsErrors) {
  return (
    Boolean(errors.settlementPeriodDays || errors.minPayoutAmount || errors.splitTotal || errors.reason) ||
    Object.keys(errors.splits).length > 0
  );
}

/**
 * Updates one split. With exactly two splits (mechanic/company), the other
 * share is kept at the remainder so the total stays 100%.
 */
export function setSplitPercent(splits: SplitDraft[], index: number, percent: string): SplitDraft[] {
  const next = splits.map((split, splitIndex) => (splitIndex === index ? { ...split, percent } : split));

  if (splits.length === 2 && DECIMAL_PATTERN.test(percent.trim()) && Number(percent) <= 100) {
    next[1 - index] = { ...next[1 - index], percent: String((10_000 - toCents(Number(percent))) / 100) };
  }

  return next;
}

export interface PolicyChange {
  label: string;
  current: string;
  proposed: string;
  changed: boolean;
}

/** Field-by-field comparison of the saved policy and the proposed one. */
export function diffPolicies(
  current: PayoutPolicy,
  proposed: PayoutPolicy,
  formatAmount: (amount: number) => string,
): PolicyChange[] {
  const row = (label: string, from: string, to: string): PolicyChange => ({
    label,
    current: from,
    proposed: to,
    changed: from !== to,
  });
  const days = (value: number) => `${value} day${value === 1 ? "" : "s"}`;
  const yesNo = (value: boolean) => (value ? "On" : "Off");

  return [
    row("Automatic settlement", yesNo(current.settlementEnabled), yesNo(proposed.settlementEnabled)),
    row("Settlement period", days(current.settlementPeriodDays), days(proposed.settlementPeriodDays)),
    row("Minimum payout", formatAmount(current.minPayoutAmount), formatAmount(proposed.minPayoutAmount)),
    ...proposed.splits.map((split) => {
      const saved = current.splits.find((item) => item.entity === split.entity);
      return row(`${split.label} share`, saved ? `${saved.percent}%` : "—", `${split.percent}%`);
    }),
  ];
}

export function isPolicyChanged(current: PayoutPolicy, proposed: PayoutPolicy) {
  return diffPolicies(current, proposed, String).some((change) => change.changed);
}
