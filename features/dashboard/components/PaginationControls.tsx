import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Accessible name for the navigation landmark, e.g. "Service Request pages". */
  label: string;
  summary?: string;
  disabled?: boolean;
}

const buttonClassName =
  "inline-flex h-8 items-center gap-1 rounded-lg px-3 transition hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10";

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  label,
  summary,
  disabled = false,
}: PaginationControlsProps) {
  return (
    <nav
      aria-label={label}
      className="flex flex-col gap-3 border-t border-[#f0f2f5] px-5 py-4 text-xs font-extrabold text-[#6f7784] dark:border-white/10 sm:flex-row sm:items-center"
    >
      <p className="mr-auto" aria-live="polite">
        Page {page} of {totalPages}
        {summary ? <span className="font-semibold"> · {summary}</span> : null}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className={buttonClassName}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className={buttonClassName}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
