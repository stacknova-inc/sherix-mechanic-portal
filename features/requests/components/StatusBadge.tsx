import {
  formatStatusLabel,
  getStatusTone,
  type StatusTone,
} from "@/features/requests/utils/service-request-status";
import { cn } from "@/utils/cn";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-[#dffbf0] text-[#047857] ring-[#c6f6df]",
  danger: "bg-[#ffe4e6] text-[#be123c] ring-[#fecdd3]",
  warning: "bg-[#fff7d8] text-[#9a6a00] ring-[#ffe7a6]",
  info: "bg-[#eaf2ff] text-[#1d4ed8] ring-[#d6e4ff]",
  neutral: "bg-[#f4f5f7] text-[#687386] ring-[#e5e8ee]",
};

interface StatusBadgeProps {
  /** Normalised backend status; the label is always rendered as text. */
  status: string | null;
  /** Prefix read by assistive tech, e.g. "Payment status". */
  srLabel?: string;
  className?: string;
}

export function StatusBadge({ status, srLabel, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center justify-center whitespace-nowrap rounded-full px-3 text-[11px] font-extrabold ring-1 ring-inset",
        toneClasses[getStatusTone(status)],
        className,
      )}
    >
      {srLabel ? <span className="sr-only">{`${srLabel}:`}&nbsp;</span> : null}
      {formatStatusLabel(status)}
    </span>
  );
}
