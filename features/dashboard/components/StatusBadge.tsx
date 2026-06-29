import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[70px] items-center justify-center rounded-full px-3 text-[10px] font-extrabold",
        className,
      )}
    >
      {children}
    </span>
  );
}
