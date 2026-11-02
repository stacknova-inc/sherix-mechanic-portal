"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { PermissionDeniedState } from "@/features/dashboard/components/PermissionDeniedState";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { PayoutImpactPreviewPanel } from "@/features/payout-settings/components/PayoutImpactPreviewPanel";
import { PayoutSettingsForm } from "@/features/payout-settings/components/PayoutSettingsForm";
import {
  usePayoutSettings,
  usePreviewPayoutSettings,
  useUpdatePayoutSettings,
} from "@/features/payout-settings/hooks/usePayoutSettings";
import type { PayoutSettings } from "@/features/payout-settings/types";
import {
  diffPolicies,
  draftFromSettings,
  draftToPolicy,
  hasErrors,
  isPolicyChanged,
  validateDraft,
  type PayoutSettingsDraft,
} from "@/features/payout-settings/utils/payout-settings";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";
import { formatMoney } from "@/lib/money";
import { getApiErrorMessage } from "@/services/api-error";

function PayoutSettingsEditor({ settings }: { settings: PayoutSettings }) {
  const [draft, setDraft] = useState<PayoutSettingsDraft>(() => draftFromSettings(settings));
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const previewMutation = usePreviewPayoutSettings();
  const updateMutation = useUpdatePayoutSettings();
  const errors = useMemo(() => validateDraft(draft), [draft]);
  const proposed = useMemo(() => draftToPolicy(draft), [draft]);
  const isChanged = isPolicyChanged(settings.policy, proposed);

  function handlePreview() {
    setShowErrors(true);
    if (hasErrors(errors)) {
      return;
    }

    previewMutation.mutate(proposed, { onSuccess: () => setStep("preview") });
  }

  function handleConfirm() {
    updateMutation.mutate(
      { ...proposed, expectedVersion: settings.version, reason: draft.reason.trim() },
      {
        onSuccess: () => {
          setStep("edit");
          setDraft((current) => ({ ...current, reason: "" }));
          setShowErrors(false);
          previewMutation.reset();
        },
      },
    );
  }

  if (step === "preview" && previewMutation.data) {
    return (
      <SectionCard title="Review payout changes" description="Step 2 of 2: check the impact before saving.">
        <PayoutImpactPreviewPanel
          changes={diffPolicies(settings.policy, proposed, (amount) => formatMoney(amount, null))}
          preview={previewMutation.data}
          isSaving={updateMutation.isPending}
          onBack={() => setStep("edit")}
          onConfirm={handleConfirm}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Payout settings" description="Step 1 of 2: set the settlement policy and revenue split.">
      {previewMutation.isError ? (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-brand-red dark:bg-red-500/10">
          Couldn&apos;t preview the change: {getApiErrorMessage(previewMutation.error)}
        </p>
      ) : null}
      <PayoutSettingsForm
        settings={settings}
        draft={draft}
        errors={errors}
        showErrors={showErrors}
        isChanged={isChanged}
        isPreviewing={previewMutation.isPending}
        onChange={setDraft}
        onPreview={handlePreview}
        onReset={() => {
          setDraft(draftFromSettings(settings));
          setShowErrors(false);
          previewMutation.reset();
        }}
      />
    </SectionCard>
  );
}

export function PayoutSettingsPage() {
  const role = useUserRole();
  const settingsQuery = usePayoutSettings();

  return (
    <DashboardShell>
      <Link
        href="/earnings/payouts"
        className="mb-6 inline-flex items-center gap-2 rounded text-sm font-extrabold text-[#6f7784] transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white/60"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Payouts
      </Link>
      <PageHeader
        title="Payout Settings"
        description="Configure how and when payouts are split between your company and your mechanics."
      />

      {!hasPermission(role, "configurePayouts") ? (
        <PermissionDeniedState
          title="Only company admins can change payout settings"
          description="Ask a company admin to update how payouts are split between your company and mechanics."
        />
      ) : settingsQuery.isLoading ? (
        <LoadingSkeleton label="Loading payout settings…" rows={4} rowClassName="h-20" />
      ) : settingsQuery.isError || !settingsQuery.data ? (
        <QueryErrorState
          error={settingsQuery.error}
          subject="payout settings"
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : (
        // A new version (after a save, or someone else's save) remounts with a fresh draft;
        // refetches of the same version keep unsaved edits.
        <PayoutSettingsEditor key={settingsQuery.data.version} settings={settingsQuery.data} />
      )}
    </DashboardShell>
  );
}
