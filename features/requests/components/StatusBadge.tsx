import type { RequestStatus } from "@/features/requests/types";
import { cn } from "@/utils/cn";

const statusClasses: Record<RequestStatus, string> = {
  Pending: "bg-[#fff7d8] text-[#9a6a00] ring-[#ffe7a6]",
  Approved: "bg-[#dcfce7] text-[#15803d] ring-[#bbf7d0]",
  Rejected: "bg-[#ffe4e6] text-[#be123c] ring-[#fecdd3]",
  "In Review": "bg-[#f1e7ff] text-[#7e22ce] ring-[#e9d5ff]",
  Completed: "bg-[#dffbf0] text-[#047857] ring-[#c6f6df]",
};

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center justify-center rounded-full px-3 text-[11px] font-extrabold ring-1 ring-inset",
        statusClasses[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
