import { apiClient } from "@/services/http-client";
import type {
  PayoutImpactEntry,
  PayoutImpactPreview,
  PayoutPolicy,
  PayoutSettings,
  PayoutSplit,
  UpdatePayoutSettingsInput,
} from "@/features/payout-settings/types";

const PAYOUT_SETTINGS_PATH = "/companies/payout-settings";
const IMPACT_PREVIEW_PATH = `${PAYOUT_SETTINGS_PATH}/impact-preview`;
/**
 * The API docs do not state the method for "Set company payout options".
 * PATCH matches the platform's other versioned settings endpoint (PATCH /policy-config).
 */
const UPDATE_METHOD = "patch" as const;
const MAX_PREVIEW_ENTRIES = 40;

type Envelope<T> = { success?: boolean; message?: string; data?: T };

type BackendSettings = {
  policy?: Partial<PayoutPolicy> & { splits?: Array<Partial<PayoutSplit>> };
  platform?: { percent?: number; basis?: string; editable?: boolean } | null;
  version?: number;
  effectiveFrom?: string | null;
  source?: string | null;
  isOverride?: boolean;
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeSplit(split: Partial<PayoutSplit>): PayoutSplit {
  const entity = split.entity ?? "unknown";
  return {
    label: split.label ?? entity.charAt(0).toUpperCase() + entity.slice(1),
    entity,
    percent: toNumber(split.percent),
  };
}

export function normalizePayoutSettings(settings: BackendSettings): PayoutSettings {
  const policy = settings.policy ?? {};

  return {
    policy: {
      settlementEnabled: Boolean(policy.settlementEnabled),
      settlementPeriodDays: toNumber(policy.settlementPeriodDays),
      minPayoutAmount: toNumber(policy.minPayoutAmount),
      splits: (policy.splits ?? []).map(normalizeSplit),
    },
    platform: settings.platform
      ? {
          percent: toNumber(settings.platform.percent),
          basis: settings.platform.basis ?? "",
          editable: Boolean(settings.platform.editable),
        }
      : null,
    version: toNumber(settings.version),
    effectiveFrom: settings.effectiveFrom ?? null,
    source: settings.source ?? null,
    isOverride: Boolean(settings.isOverride),
  };
}

function unwrap<T>(payload: Envelope<T> | T): T {
  return payload && typeof payload === "object" && "data" in payload && payload.data !== undefined
    ? (payload as Envelope<T>).data as T
    : (payload as T);
}

function humanize(path: string) {
  const words = path
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Flattens primitive values of an undocumented response into labelled rows. */
function flattenEntries(value: unknown, path: string, entries: PayoutImpactEntry[]) {
  if (entries.length >= MAX_PREVIEW_ENTRIES || value === null || value === undefined) {
    return;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    entries.push({ label: humanize(path), value: typeof value === "boolean" ? (value ? "Yes" : "No") : String(value) });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenEntries(item, `${path} ${index + 1}`, entries));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) =>
      flattenEntries(child, path ? `${path} ${key}` : key, entries),
    );
  }
}

export function normalizeImpactPreview(payload: unknown): PayoutImpactPreview {
  const data = unwrap<unknown>(payload as Envelope<unknown>);
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const { effectiveFrom, ...rest } = record;
  const entries: PayoutImpactEntry[] = [];
  flattenEntries(rest, "", entries);

  return {
    effectiveFrom: typeof effectiveFrom === "string" ? effectiveFrom : null,
    entries,
  };
}

/** GET /companies/payout-settings */
export async function getPayoutSettings(): Promise<PayoutSettings> {
  const response = await apiClient.get<Envelope<BackendSettings>>(PAYOUT_SETTINGS_PATH);
  return normalizePayoutSettings(unwrap(response.data) ?? {});
}

/** POST /companies/payout-settings/impact-preview — read-only. */
export async function previewPayoutSettings(policy: PayoutPolicy): Promise<PayoutImpactPreview> {
  const response = await apiClient.post<unknown>(IMPACT_PREVIEW_PATH, policy);
  return normalizeImpactPreview(response.data);
}

/** Saves the policy with optimistic concurrency (expectedVersion); the backend returns 409 when stale. */
export async function updatePayoutSettings(input: UpdatePayoutSettingsInput): Promise<void> {
  await apiClient[UPDATE_METHOD](PAYOUT_SETTINGS_PATH, input);
}
