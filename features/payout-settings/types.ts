export interface PayoutSplit {
  label: string;
  /** e.g. "mechanic" | "company" */
  entity: string;
  percent: number;
}

export interface PayoutPolicy {
  settlementEnabled: boolean;
  settlementPeriodDays: number;
  minPayoutAmount: number;
  splits: PayoutSplit[];
}

/** Sherix commission deducted before the split; read-only for companies. */
export interface PlatformCommission {
  percent: number;
  /** e.g. "job_gross" */
  basis: string;
  editable: boolean;
}

export interface PayoutSettings {
  policy: PayoutPolicy;
  platform: PlatformCommission | null;
  version: number;
  effectiveFrom: string | null;
  /** e.g. "Company Override" or the platform default */
  source: string | null;
  isOverride: boolean;
}

export interface UpdatePayoutSettingsInput extends PayoutPolicy {
  expectedVersion: number;
  reason: string;
}

/** A labelled value from the impact-preview response. */
export interface PayoutImpactEntry {
  label: string;
  value: string;
}

export interface PayoutImpactPreview {
  effectiveFrom: string | null;
  entries: PayoutImpactEntry[];
}
