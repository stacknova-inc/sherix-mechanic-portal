import type { LucideIcon } from "lucide-react";

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
    <section className="rounded-lg border border-[#f0f2f5] bg-white p-5 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-lg bg-[#fff0f4] text-brand-red">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-[#747d8b]">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-extrabold tracking-tight ${valueClassName}`}>
        {value}
      </p>
      {helper ? (
        <p className="mt-3 text-xs text-[#9aa1ad]">
          {trend ? (
            <span className="mr-2 rounded-full bg-[#eafff4] px-2 py-0.5 text-[10px] font-extrabold text-[#07a86d]">
              {trend}
            </span>
          ) : null}
          {helper}
        </p>
      ) : null}
    </section>
  );
}
