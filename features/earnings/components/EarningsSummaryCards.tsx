import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import type { EarningsSummary } from "@/features/earnings/types";
import { formatMoney } from "@/lib/money";

interface EarningsSummaryCardsProps {
  summary: EarningsSummary | undefined;
  periodLabel: string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-extrabold text-brand-dark dark:text-white">{title}</h2>
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#eef0f3] text-[#8f96a3] dark:border-white/10"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-6 break-words text-xl font-bold tracking-tight text-brand-dark dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-[#7a828f] dark:text-white/50">{helper}</p>
    </section>
  );
}

function countLabel(count: number, noun: string) {
  return `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
}

export function EarningsSummaryCards({ summary, periodLabel, isLoading, error, onRetry }: EarningsSummaryCardsProps) {
  if (isLoading) {
    return <LoadingSkeleton label="Loading payout summary…" rows={4} rowClassName="h-36 rounded-xl" className="grid gap-4 space-y-0 sm:grid-cols-2 xl:grid-cols-4" />;
  }

  if (error || !summary) {
    return <QueryErrorState error={error} subject="the payout summary" onRetry={onRetry} />;
  }

  const money = (amount: number) => formatMoney(amount, summary.currency);

  const totalAmount = summary.pendingPayouts.amount + summary.completedPayouts.amount + summary.failedPayouts.amount;
  const totalCount = summary.pendingPayouts.count + summary.completedPayouts.count + summary.failedPayouts.count;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={`Payout summary, ${periodLabel}`}>
      <SummaryCard title={`Total payouts — ${periodLabel}`} value={money(totalAmount)} helper={`${countLabel(totalCount, "payout")} requested`} icon={Wallet} />
      <SummaryCard title="Pending payouts" value={money(summary.pendingPayouts.amount)} helper={`${countLabel(summary.pendingPayouts.count, "payout")} pending or processing`} icon={Clock3} />
      <SummaryCard title="Successful payouts" value={money(summary.completedPayouts.amount)} helper={`${countLabel(summary.completedPayouts.count, "payout")} paid to mechanics`} icon={CheckCircle2} />
      <SummaryCard title="Failed payouts" value={money(summary.failedPayouts.amount)} helper={`${countLabel(summary.failedPayouts.count, "payout")} need attention`} icon={AlertTriangle} />
    </div>
  );
}
