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
const MAX_PREVIEW_ENTRIES = 40;

type Envelope<T> = { success?: boolean; message?: string; data?: T };

type BackendSettings = {
  policy?: Partial<PayoutPolicy> & { splits?: Array<Partial<PayoutSplit>> };
  platform?: { entity?: string; percent?: number; basis?: string; editable?: boolean; source?: string } | null;
  version?: number;
  effectiveFrom?: string | null;
  source?: string | null;
  isOverride?: boolean;
};

function requiredNumber(value: unknown, field: string) {
  const number = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(number)) {
    throw new Error(`Payout settings response is missing a valid ${field}.`);
  }
  return number;
}

export function normalizePayoutSettings(settings: BackendSettings): PayoutSettings {
  const policy = settings.policy ?? {};
  if (typeof policy.settlementEnabled !== "boolean") {
    throw new Error("Payout settings response is missing settlementEnabled.");
  }
  if (!Array.isArray(policy.splits)) {
    throw new Error("Payout settings response is missing revenue splits.");
  }
  const splits = policy.splits.map((split) => {
    if (typeof split.entity !== "string" || typeof split.label !== "string") {
      throw new Error("Payout settings response contains an invalid revenue split.");
    }
    return {
      label: split.label,
      entity: split.entity,
      percent: requiredNumber(split.percent, `split percent for ${split.entity}`),
    };
  });

  return {
    policy: {
      settlementEnabled: policy.settlementEnabled,
      settlementPeriodDays: requiredNumber(policy.settlementPeriodDays, "settlementPeriodDays"),
      minPayoutAmount: requiredNumber(policy.minPayoutAmount, "minPayoutAmount"),
      splits,
    },
    platform: settings.platform
      ? {
          entity: settings.platform.entity ?? null,
          percent: requiredNumber(settings.platform.percent, "platform percent"),
          basis: settings.platform.basis ?? "",
          editable: settings.platform.editable === true,
          source: settings.platform.source ?? null,
        }
      : null,
    version: requiredNumber(settings.version, "version"),
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

/** POST /companies/payout-settings/impact-preview. */
export async function previewPayoutSettings(policy: PayoutPolicy): Promise<PayoutImpactPreview> {
  const response = await apiClient.post<unknown>(IMPACT_PREVIEW_PATH, policy);
  return normalizeImpactPreview(response.data);
}

/** Saves the policy with optimistic concurrency (expectedVersion); the backend returns 409 when stale. */
export async function updatePayoutSettings(input: UpdatePayoutSettingsInput): Promise<void> {
  await apiClient.patch(PAYOUT_SETTINGS_PATH, input);
}
