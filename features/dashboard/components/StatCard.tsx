import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  trend?: string;
  icon: LucideIcon;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  valueClassName = "text-brand-dark",
}: StatCardProps) {
  return (
    <section className="group rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(24,28,36,0.08)] dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-extrabold text-brand-dark dark:text-white">
          {label}
        </p>
        <span className="flex size-8 items-center justify-center rounded-lg border border-[#eef0f3] text-[#8f96a3] transition group-hover:border-brand-red group-hover:text-brand-red dark:border-white/10">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-8 flex items-end justify-between gap-3">
        <p
          className={cn(
            "text-2xl font-bold leading-none tracking-tight dark:text-white",
            valueClassName,
          )}
        >
          {value}
        </p>
        {helper || trend ? (
          <div className="text-right">
            {trend ? (
              <span className="inline-flex items-center rounded-full bg-[#eafff4] px-2 py-0.5 text-[10px] font-bold text-[#07a86d]">
                {trend}
              </span>
            ) : null}
          
          </div>
        ) : null}
      </div>
    </section>
  );
}
