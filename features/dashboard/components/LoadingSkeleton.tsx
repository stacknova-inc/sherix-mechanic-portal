import { cn } from "@/utils/cn";

interface LoadingSkeletonProps {
  /** Announced to assistive technology, e.g. "Loading transactions…". */
  label: string;
  rows?: number;
  rowClassName?: string;
  className?: string;
}

export function LoadingSkeleton({ label, rows = 4, rowClassName = "h-12", className }: LoadingSkeletonProps) {
  return (
    <div role="status" className={cn("space-y-3", className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn("animate-pulse rounded-lg bg-[#f1f3f6] dark:bg-white/10", rowClassName)}
        />
      ))}
    </div>
  );
}
