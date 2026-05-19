import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface RequestStatsCardProps {
  title: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;

}

const toneClasses = {
  positive: "bg-[#eafff4] text-[#07a86d]",
  warning: "bg-[#fff8df] text-[#b77900]",
  danger: "bg-[#ffe8ed] text-brand-red",
};

export function RequestStatsCard({
  title,
  value,
  helper,
  icon: Icon,

}: RequestStatsCardProps) {
  return (
    <section className="group rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(24,28,36,0.08)] dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-extrabold text-brand-dark dark:text-white">
          {title}
        </p>
        <span className="flex size-8 items-center justify-center rounded-lg border border-[#eef0f3] text-[#8f96a3] transition group-hover:border-brand-red group-hover:text-brand-red dark:border-white/10">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-8 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold leading-none tracking-tight text-brand-dark dark:text-white">
          {value}
        </p>
        <div className="text-right">
          
          <p className="mt-1 text-[10px] font-semibold text-[#7a828f] dark:text-white/50">
            {helper}
          </p>
        </div>
      </div>
    </section>
  );
}
