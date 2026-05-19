import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface OverviewStat {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  trend?: string;
}

export interface ActiveJob {
  id: string;
  employeeName: string;
  vehicle: string;
  service: string;
  mechanic: string;
  time: string;
  eta: string;
  status: "En Route" | "On Job" | "Finishing" | "Pending";
}

export interface ActiveRequest {
  id: string;
  mechanicName: string;
  area: string;
  status: "ON JOB" | "AVAILABLE" | "BREAK" | "OFFLINE";
  vehicle: string;
  indicatorClassName: string;
}

export interface ServiceDistributionSegment {
  label: string;
  value: string;
  colorClassName: string;
}
