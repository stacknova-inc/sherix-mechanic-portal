"use client";

import { Info, Loader2 } from "lucide-react";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/features/dashboard/components/form-styles";
import type { PayoutImpactPreview } from "@/features/payout-settings/types";
import type { PolicyChange } from "@/features/payout-settings/utils/payout-settings";
import { formatDateTime } from "@/lib/date-format";
import { cn } from "@/utils/cn";

interface PayoutImpactPreviewPanelProps {
  changes: PolicyChange[];
  preview: PayoutImpactPreview;
  isSaving: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function PayoutImpactPreviewPanel({ changes, preview, isSaving, onBack, onConfirm }: PayoutImpactPreviewPanelProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Proposed payout setting changes</caption>
          <thead>
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              <th scope="col" className="py-3 pr-3">Setting</th>
              <th scope="col" className="px-3 py-3">Current</th>
              <th scope="col" className="px-3 py-3">New</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr
                key={change.label}
                className={cn("border-t border-[#f3f5f7] dark:border-white/10", !change.changed && "text-[#8f96a3]")}
              >
                <th scope="row" className="py-3 pr-3 font-extrabold">
                  {change.label}
                  {change.changed ? <span className="sr-only"> (changed)</span> : null}
                </th>
                <td className="px-3 py-3">{change.current}</td>
                <td className={cn("px-3 py-3", change.changed && "font-extrabold text-brand-dark dark:text-white")}>
                  {change.proposed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 rounded-xl border border-[#d6e4ff] bg-[#f3f7ff] p-4 text-sm text-[#1e3a8a] dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-200">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-extrabold">Settled payouts will not change.</p>
          <p>
            {preview.effectiveFrom
              ? `The new settings apply from ${formatDateTime(preview.effectiveFrom)}.`
              : "The new settings apply from the effective date Sherix sets when you save."}{" "}
            Payouts that have already been settled keep the settings that applied at the time.
          </p>
        </div>
      </div>

      {preview.entries.length ? (
        <section aria-labelledby="impact-details-heading">
          <h3 id="impact-details-heading" className="text-sm font-extrabold text-brand-dark dark:text-white">
            Impact details from Sherix
          </h3>
          <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {preview.entries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-[#e5e8ee] py-1.5 dark:border-white/10"
              >
                <dt className="text-[#596170] dark:text-white/60">{entry.label}</dt>
                <dd className="text-right font-semibold text-brand-dark dark:text-white">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[#f0f2f5] pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
        <button type="button" onClick={onBack} disabled={isSaving} className={secondaryButtonClassName}>
          Back to edit
        </button>
        <button type="button" onClick={onConfirm} disabled={isSaving} className={primaryButtonClassName}>
          {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSaving ? "Saving…" : "Confirm and save"}
        </button>
      </div>
    </div>
  );
}
