import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import type { FinancialStat } from "@/features/earnings/types";

interface FinancialStatsCardsProps {
  title: string;
  periodLabel?: string;
  stats: Array<{ title: string; stat: FinancialStat }> | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function FinancialStatsCards({ title, periodLabel, stats, isLoading, error, onRetry }: FinancialStatsCardsProps) {
  if (isLoading) {
    return <LoadingSkeleton label={`Loading ${title.toLowerCase()}…`} rows={stats?.length ?? 4} rowClassName="h-36 rounded-xl" className="grid gap-4 space-y-0 sm:grid-cols-2 xl:grid-cols-4" />;
  }

  if (error || !stats) {
    return <QueryErrorState error={error} subject={title.toLowerCase()} onRetry={onRetry} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={`${title}${periodLabel ? `, ${periodLabel}` : ""}`}>
      {stats.map(({ title: statTitle, stat }) => (
        <section key={statTitle} className="rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
          <h2 className="text-sm font-extrabold text-brand-dark dark:text-white">{statTitle}</h2>
          <p className="mt-6 break-words text-xl font-bold tracking-tight text-brand-dark dark:text-white">{stat.formatted}</p>
          <p className="mt-1 text-[11px] font-semibold text-[#7a828f] dark:text-white/50">{stat.label}</p>
        </section>
      ))}
    </div>
  );
}
