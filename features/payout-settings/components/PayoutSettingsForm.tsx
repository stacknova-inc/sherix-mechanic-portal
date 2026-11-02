"use client";

import { Loader2 } from "lucide-react";
import {
  fieldClassName,
  fieldLabelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/features/dashboard/components/form-styles";
import type { PayoutSettings } from "@/features/payout-settings/types";
import {
  REASON_LENGTH,
  SETTLEMENT_PERIOD_RANGE,
  setSplitPercent,
  type PayoutSettingsDraft,
  type PayoutSettingsErrors,
} from "@/features/payout-settings/utils/payout-settings";
import { formatDateTime } from "@/lib/date-format";
import { cn } from "@/utils/cn";

interface PayoutSettingsFormProps {
  settings: PayoutSettings;
  draft: PayoutSettingsDraft;
  errors: PayoutSettingsErrors;
  showErrors: boolean;
  isChanged: boolean;
  isPreviewing: boolean;
  onChange: (draft: PayoutSettingsDraft) => void;
  onPreview: () => void;
  onReset: () => void;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1.5 text-xs font-bold text-brand-red">{message}</p> : null;
}

export function PayoutSettingsForm({
  settings,
  draft,
  errors,
  showErrors,
  isChanged,
  isPreviewing,
  onChange,
  onPreview,
  onReset,
}: PayoutSettingsFormProps) {
  const visible = showErrors ? errors : { splits: {} as Record<number, string> };
  const total = draft.splits.reduce((sum, split) => sum + (Number(split.percent) || 0), 0);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onPreview();
      }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-[#eef0f3] bg-[#fbfcfd] p-4 text-sm text-[#596170] dark:border-white/10 dark:bg-white/[0.02] dark:text-white/65">
        {settings.platform ? (
          <p>
            Sherix deducts a <strong>{settings.platform.percent}% platform commission</strong>
            {settings.platform.basis ? ` (based on ${settings.platform.basis.replace(/_/g, " ")})` : ""} first
            {settings.platform.editable ? "." : ", which companies can't change."} The split below divides what
            remains between your mechanic and your company.
          </p>
        ) : (
          <p>The split below divides each Service Request&apos;s earnings after the Sherix platform commission.</p>
        )}
        <p className="mt-2 text-xs font-semibold">
          Version {settings.version}
          {settings.source ? ` · ${settings.source}` : ""}
          {settings.effectiveFrom ? ` · in effect since ${formatDateTime(settings.effectiveFrom)}` : ""}
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-base font-extrabold text-brand-dark dark:text-white">Settlement</legend>

        <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark dark:text-white">
          <input
            type="checkbox"
            checked={draft.settlementEnabled}
            onChange={(event) => onChange({ ...draft, settlementEnabled: event.target.checked })}
            className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Pay mechanics automatically each settlement period
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <div>
            <label htmlFor="settlement-period" className={fieldLabelClassName}>Settlement period (days)</label>
            <input
              id="settlement-period"
              inputMode="numeric"
              value={draft.settlementPeriodDays}
              onChange={(event) => onChange({ ...draft, settlementPeriodDays: event.target.value })}
              aria-invalid={Boolean(visible.settlementPeriodDays)}
              aria-describedby={visible.settlementPeriodDays ? "settlement-period-error" : "settlement-period-help"}
              className={fieldClassName}
            />
            {visible.settlementPeriodDays ? (
              <FieldError id="settlement-period-error" message={visible.settlementPeriodDays} />
            ) : (
              <p id="settlement-period-help" className="mt-1.5 text-xs text-[#8f96a3]">
                {SETTLEMENT_PERIOD_RANGE.min}–{SETTLEMENT_PERIOD_RANGE.max} days between payouts.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="min-payout" className={fieldLabelClassName}>Minimum payout amount</label>
            <input
              id="min-payout"
              inputMode="decimal"
              value={draft.minPayoutAmount}
              onChange={(event) => onChange({ ...draft, minPayoutAmount: event.target.value })}
              aria-invalid={Boolean(visible.minPayoutAmount)}
              aria-describedby={visible.minPayoutAmount ? "min-payout-error" : "min-payout-help"}
              className={fieldClassName}
            />
            {visible.minPayoutAmount ? (
              <FieldError id="min-payout-error" message={visible.minPayoutAmount} />
            ) : (
              <p id="min-payout-help" className="mt-1.5 text-xs text-[#8f96a3]">
                Balances below this roll over to the next period.
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-extrabold text-brand-dark dark:text-white">Revenue split</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          {draft.splits.map((split, index) => {
            const inputId = `split-${split.entity}`;
            const error = visible.splits[index];

            return (
              <div key={split.entity}>
                <label htmlFor={inputId} className={fieldLabelClassName}>{split.label} share</label>
                <div className="relative">
                  <input
                    id={inputId}
                    inputMode="decimal"
                    value={split.percent}
                    onChange={(event) =>
                      onChange({ ...draft, splits: setSplitPercent(draft.splits, index, event.target.value) })
                    }
                    aria-invalid={Boolean(error || visible.splitTotal)}
                    aria-describedby={error ? `${inputId}-error` : visible.splitTotal ? "split-total-error" : undefined}
                    className={cn(fieldClassName, "pr-10")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#8f96a3]" aria-hidden="true">%</span>
                </div>
                <FieldError id={`${inputId}-error`} message={error} />
              </div>
            );
          })}
        </div>
        {visible.splitTotal ? (
          <FieldError id="split-total-error" message={visible.splitTotal} />
        ) : (
          <p className="text-xs font-semibold text-[#8f96a3]" aria-live="polite">
            Total: {Math.round(total * 100) / 100}%
          </p>
        )}
      </fieldset>

      <div className="lg:max-w-2xl">
        <label htmlFor="payout-reason" className={fieldLabelClassName}>Reason for change</label>
        <textarea
          id="payout-reason"
          rows={2}
          value={draft.reason}
          maxLength={REASON_LENGTH.max}
          onChange={(event) => onChange({ ...draft, reason: event.target.value })}
          aria-invalid={Boolean(visible.reason)}
          aria-describedby={visible.reason ? "payout-reason-error" : undefined}
          placeholder="e.g. Company retains 5% of the mechanic's net"
          className={cn(fieldClassName, "h-auto py-2.5")}
        />
        <FieldError id="payout-reason-error" message={visible.reason} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#f0f2f5] pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
        <button type="button" onClick={onReset} disabled={!isChanged || isPreviewing} className={secondaryButtonClassName}>
          Discard changes
        </button>
        <button type="submit" disabled={!isChanged || isPreviewing} className={primaryButtonClassName}>
          {isPreviewing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Preview impact
        </button>
      </div>
      {!isChanged ? <p className="text-right text-xs text-[#8f96a3]">Change a setting to preview its impact.</p> : null}
    </form>
  );
}
