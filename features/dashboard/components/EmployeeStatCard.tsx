import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmployeeStatCardProps {
  title: string;
  value: string | number;
  helper: string;
  trend: string;
  icon: LucideIcon;
  tone: "positive" | "info" | "muted" | "danger";
}

const toneClasses = {
  positive: {
    icon: "group-hover:border-[#07a86d] group-hover:text-[#07a86d]",
    trend: "bg-[#eafff4] text-[#07a86d]",
  },
  info: {
    icon: "group-hover:border-blue-500 group-hover:text-blue-600",
    trend: "bg-[#eaf2ff] text-blue-600",
  },
  muted: {
    icon: "group-hover:border-[#8f96a3] group-hover:text-[#687386]",
    trend: "bg-[#f4f5f7] text-[#687386]",
  },
  danger: {
    icon: "group-hover:border-brand-red group-hover:text-brand-red",
    trend: "bg-[#ffe8ed] text-brand-red",
  },
};

export function EmployeeStatCard({
  title,
  value,
  helper,
  trend,
  icon: Icon,
  tone,
}: EmployeeStatCardProps) {
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
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
              toneClasses[tone].trend,
            )}
          >
            {trend}
          </span>
          <p className="mt-1 text-[10px] font-semibold text-[#7a828f] dark:text-white/50">
            {helper}
          </p>
        </div>
      </div>
    </section>
  );
}
