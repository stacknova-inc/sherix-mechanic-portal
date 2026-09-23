import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface EarningsStatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
  tone: "positive" | "info" | "muted" | "danger";
}

const toneClasses = {
  positive: {
    icon: "group-hover:border-[#07a86d] group-hover:text-[#07a86d]",
    trend: "text-[#07a86d] bg-[#eafff4]",
  },
  info: {
    icon: "group-hover:border-blue-500 group-hover:text-blue-600",
    trend: "text-blue-600 bg-[#eaf2ff]",
  },
  muted: {
    icon: "group-hover:border-[#8f96a3] group-hover:text-[#687386]",
    trend: "text-[#687386] bg-[#f4f5f7]",
  },
  danger: {
    icon: "group-hover:border-brand-red group-hover:text-brand-red",
    trend: "text-brand-red bg-[#ffe8ed]",
  },
};

export function EarningsStatCard({
  title,
  value,

  trend,
  icon: Icon,
  tone,
}: EarningsStatCardProps) {
  const isPositiveTrend = trend.startsWith("+");

  return (
    <section className="group rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(24,28,36,0.08)] dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-extrabold text-brand-dark dark:text-white">
          {title}
        </p>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border border-[#eef0f3] text-[#8f96a3] transition dark:border-white/10",
            toneClasses[tone].icon,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-8 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold leading-none tracking-tight text-brand-dark dark:text-white">
          {value}
        </p>

        <div className="text-right">
          <div
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              toneClasses[tone].trend,
              isPositiveTrend ? "" : "text-red-600 bg-red-50"
            )}
          >
            {trend}
          </div>
         
        </div>
      </div>
    </section>
  );
}