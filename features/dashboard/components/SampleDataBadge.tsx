import { FlaskConical } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Marks UI that is rendered from sample data because its backend endpoint does
 * not exist yet. Remove it from a screen when that screen's hooks are wired to
 * the backend (see FRONTEND_NOTES.md).
 */
export function SampleDataBadge({ className }: { className?: string }) {
  return (
    <span
      title="This section shows sample data until its backend endpoint is connected."
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full bg-[#fff4e5] px-2.5 text-[11px] font-extrabold text-[#9a5b00] ring-1 ring-inset ring-[#ffe0b3] dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      Sample data
    </span>
  );
}
