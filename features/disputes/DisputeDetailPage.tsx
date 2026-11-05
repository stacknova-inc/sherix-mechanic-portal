"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Lock } from "lucide-react";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { DisputeResponseForm } from "@/features/disputes/components/DisputeResponseForm";
import { useDispute, useEvidenceDownload } from "@/features/disputes/hooks/useDisputes";
import type { DisputeDetail, DisputeParty } from "@/features/disputes/types";
import { formatBytes, isImageType } from "@/features/disputes/utils/evidence-files";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";
import { formatDate, formatDateTime } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

const PARTY_LABELS: Record<DisputeParty, string> = {
  customer: "Customer",
  company: "Your company",
  mechanic: "Mechanic",
  sherix: "Sherix",
};

const OUTCOME_LABELS: Record<NonNullable<DisputeDetail["resolution"]>["outcome"], string> = {
  refund_customer: "Customer refunded",
  partial_refund: "Partial refund to customer",
  release_to_company: "Payout released to company",
  dismissed: "Dispute dismissed",
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase text-[#8a929e]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#343a45] dark:text-white/80">{children}</dd>
    </div>
  );
}

function EvidenceList({ dispute }: { dispute: DisputeDetail }) {
  const download = useEvidenceDownload(dispute.id);

  if (!dispute.evidence.length) {
    return <p className="text-sm text-[#6f7784] dark:text-white/55">No evidence has been submitted yet.</p>;
  }

  return (
    <ul className="divide-y divide-[#f3f5f7] dark:divide-white/10">
      {dispute.evidence.map((item) => {
        const Icon = isImageType(item.mimeType) ? ImageIcon : FileText;
        const isDownloading = download.isPending && download.variables === item.id;

        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687386] dark:bg-white/10" aria-hidden="true">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-brand-dark dark:text-white" title={item.fileName}>{item.fileName}</p>
              <p className="text-xs text-[#8f96a3]">
                {PARTY_LABELS[item.uploadedBy]} · {formatBytes(item.sizeBytes)} · {formatDateTime(item.uploadedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => download.mutate(item.id)}
              disabled={isDownloading}
              aria-label={`Download ${item.fileName}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e5e8ee] text-[#4b535f] transition hover:border-brand-red hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60 dark:border-white/10 dark:text-white/80"
            >
              <Download className="size-4" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function DisputeContent({ dispute }: { dispute: DisputeDetail }) {
  const role = useUserRole();
  const canRespond = hasPermission(role, "respondToDisputes");
  const isResolved = dispute.status === "resolved";

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Dispute" className="xl:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Detail label="Status"><StatusBadge status={dispute.status} /></Detail>
            <Detail label="Reason">{dispute.category}</Detail>
            <Detail label="Amount in dispute">{formatMoney(dispute.amountInDispute, dispute.currency)}</Detail>
            <Detail label="Opened">{formatDateTime(dispute.openedAt)}</Detail>
            <Detail label="Last updated">{formatDateTime(dispute.updatedAt)}</Detail>
            <Detail label="Response due">{dispute.responseDueAt ? formatDateTime(dispute.responseDueAt) : "No response due"}</Detail>
          </dl>
          <div className="mt-5 rounded-xl bg-[#f7f8fa] p-4 dark:bg-white/[0.04]">
            <p className="text-[11px] font-extrabold uppercase text-[#8a929e]">Customer&apos;s statement</p>
            <p className="mt-1 text-sm text-[#343a45] dark:text-white/80">&ldquo;{dispute.customerStatement}&rdquo;</p>
          </div>
        </SectionCard>

        <SectionCard title="Payment & payout">
          <dl className="grid gap-4">
            <Detail label="Customer payment"><StatusBadge status={dispute.paymentStatus} srLabel="Payment status" /></Detail>
            <Detail label="Mechanic payout"><StatusBadge status={dispute.payoutStatus} srLabel="Payout status" /></Detail>
            <Detail label="Service Request amount">{formatMoney(dispute.serviceRequest.amount, dispute.currency)}</Detail>
          </dl>
          {dispute.payoutStatus === "on_hold" ? (
            <p className="mt-4 text-xs font-semibold text-[#9a6a00]">The payout for this Service Request is held until the dispute is resolved.</p>
          ) : null}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Service Request & parties">
          <dl className="grid gap-4">
            <Detail label="Service Request">{dispute.serviceRequest.reference} · {dispute.serviceRequest.serviceName}</Detail>
            <Detail label="Service date">{formatDate(dispute.serviceRequest.date)}</Detail>
            <Detail label="Customer">{dispute.customerName}</Detail>
            <Detail label="Assigned mechanic">{dispute.mechanic.name}</Detail>
          </dl>
        </SectionCard>

        <SectionCard title="Timeline" className="xl:col-span-2">
          <ol className="relative space-y-4 border-l border-[#e5e8ee] pl-5 dark:border-white/10">
            {dispute.timeline.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand-red ring-4 ring-white dark:ring-[#1b1d22]" aria-hidden="true" />
                <p className="text-sm font-extrabold text-brand-dark dark:text-white">{event.label}</p>
                <p className="text-xs font-semibold text-[#8f96a3]">
                  <time dateTime={event.at}>{formatDateTime(event.at)}</time> · {PARTY_LABELS[event.actor]}
                </p>
                {event.note ? <p className="mt-1 text-sm text-[#596170] dark:text-white/65">{event.note}</p> : null}
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Evidence" description="Files are downloaded through a secure, time-limited link.">
          <EvidenceList dispute={dispute} />
        </SectionCard>

        <SectionCard title="Your company's response">
          {dispute.companyResponse ? (
            <div>
              <p className="whitespace-pre-line text-sm text-[#343a45] dark:text-white/80">{dispute.companyResponse.message}</p>
              <p className="mt-2 text-xs font-semibold text-[#8f96a3]">
                Submitted by {dispute.companyResponse.submittedBy} · {formatDateTime(dispute.companyResponse.submittedAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#6f7784] dark:text-white/55">
              {isResolved ? "Your company did not respond to this dispute." : "You haven't responded yet."}
            </p>
          )}
        </SectionCard>
      </div>

      {isResolved && dispute.resolution ? (
        <SectionCard title="Resolution" badge={<StatusBadge status="resolved" />}>
          <dl className="grid gap-4 sm:grid-cols-3">
            <Detail label="Outcome">{OUTCOME_LABELS[dispute.resolution.outcome]}</Detail>
            <Detail label="Refund">
              {dispute.resolution.refundAmount !== null ? formatMoney(dispute.resolution.refundAmount, dispute.currency) : "No refund"}
            </Detail>
            <Detail label="Resolved">{formatDateTime(dispute.resolution.resolvedAt)}</Detail>
          </dl>
          <p className="mt-4 text-sm text-[#343a45] dark:text-white/80">{dispute.resolution.summary}</p>
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#6f7784] dark:text-white/55">
            <Lock className="size-3.5" aria-hidden="true" />
            This dispute is resolved and read-only. Contact support if you believe the outcome is wrong.
          </p>
        </SectionCard>
      ) : !canRespond ? (
        <SectionCard title="Respond to this dispute">
          <p className="flex items-center gap-2 text-sm text-[#6f7784] dark:text-white/55">
            <Lock className="size-4" aria-hidden="true" />
            Only company admins can respond to disputes.
          </p>
        </SectionCard>
      ) : (
        <SectionCard
          title={dispute.companyResponse ? "Add more information" : "Respond to this dispute"}
          description={
            dispute.responseDueAt ? `Respond by ${formatDateTime(dispute.responseDueAt)}.` : "Sherix is reviewing this dispute."
          }
        >
          <DisputeResponseForm disputeId={dispute.id} isFollowUp={Boolean(dispute.companyResponse)} />
        </SectionCard>
      )}
    </div>
  );
}

export function DisputeDetailPage({ disputeId }: { disputeId: string }) {
  const query = useDispute(disputeId);
  const status = (query.error as { status?: number } | null)?.status;

  return (
    <DashboardShell>
      <Link
        href="/disputes"
        className="mb-6 inline-flex items-center gap-2 rounded text-sm font-extrabold text-[#6f7784] transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white/60"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to disputes
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white md:text-[34px]">
          Dispute {query.data?.reference ?? ""}
        </h1>
        {query.data ? <StatusBadge status={query.data.status} /> : null}
        <SampleDataBadge />
      </div>

      {query.isLoading ? (
        <LoadingSkeleton label="Loading dispute…" rows={3} rowClassName="h-44 rounded-xl" />
      ) : status === 404 ? (
        <EmptyState title="Dispute not found" description="It may not exist, or it isn't linked to your company." />
      ) : query.isError || !query.data ? (
        <QueryErrorState error={query.error} subject="this dispute" onRetry={() => void query.refetch()} />
      ) : (
        <DisputeContent dispute={query.data} />
      )}
    </DashboardShell>
  );
}
