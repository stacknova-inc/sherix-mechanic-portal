import { useId } from "react";
import { cn } from "@/utils/cn";

interface SectionCardProps {
  title: string;
  description?: string;
  /** Rendered next to the title, e.g. a SampleDataBadge. */
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Removes body padding for edge-to-edge tables. */
  flush?: boolean;
}

export function SectionCard({
  title,
  description,
  badge,
  actions,
  children,
  className,
  flush = false,
}: SectionCardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "rounded-xl border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-[#f0f2f5] px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center">
        <div className="mr-auto min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="text-lg font-extrabold text-brand-dark dark:text-white">
              {title}
            </h2>
            {badge}
          </div>
          {description ? (
            <p className="mt-0.5 text-xs font-semibold text-[#8f96a3]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}
