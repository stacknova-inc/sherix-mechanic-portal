import type { RequestStatus } from "@/features/requests/types";
import { cn } from "@/utils/cn";

export type RequestTab = "All" | RequestStatus;

interface RequestTabsProps {
  activeTab: RequestTab;
  counts: Record<RequestTab, number>;
  onChange: (tab: RequestTab) => void;
}

const tabs: RequestTab[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "In Review",
  "Completed",
];

export function RequestTabs({ activeTab, counts, onChange }: RequestTabsProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#eef0f3] bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
      <div className="flex min-w-max items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-extrabold transition duration-200",
                isActive
                  ? "bg-brand-dark text-white shadow-[0_10px_20px_rgba(23,25,31,0.18)] dark:bg-white dark:text-brand-dark"
                  : "text-[#6f7784] hover:bg-[#f7f8fa] hover:text-brand-dark dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              {tab}
              {counts[tab] ? (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px]",
                    isActive
                      ? "bg-white/15 text-white dark:bg-brand-dark/10 dark:text-brand-dark"
                      : "bg-[#d7f9df] text-[#07a86d]",
                  )}
                >
                  {counts[tab]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
