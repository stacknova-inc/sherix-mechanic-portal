import type { ActiveJob } from "@/features/dashboard/types/dashboard";

export function getJobStatusClasses(status: ActiveJob["status"]): string {
  const styles: Record<ActiveJob["status"], string> = {
    "En Route": "bg-[#f3f5f8] text-[#667080]",
    "On Job": "bg-[#e8fff4] text-[#04975e]",
    Finishing: "bg-[#f3f5f8] text-[#3d4451]",
    Pending: "bg-brand-red text-white",
  };

  return styles[status];
}
