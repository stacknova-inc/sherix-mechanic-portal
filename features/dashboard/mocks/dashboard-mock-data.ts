import {
  CircleDollarSign,
  Gauge,
  UsersRound,
  Zap,
} from "lucide-react";
import type {
  ActiveJob,
  ActiveRequest,
  OverviewStat,
  ServiceDistributionSegment,
} from "@/features/dashboard/types/dashboard";

export const overviewStats: OverviewStat[] = [
  { label: "Active Requests", value: "12", helper: "Jobs currently live", icon: Zap },
  {
    label: "Active Employees",
    value: "8 / 14",
    helper: "Currently on shift",
    icon: UsersRound,
  },
  { label: "Ongoing Jobs", value: "6", helper: "In-progress repairs", icon: Gauge },
  {
    label: "Total Earnings Today",
    value: "$4,820",
    helper: "+12% vs yesterday",
    trend: "+12%",
    icon: CircleDollarSign,
  },
];

export const activeJobs: ActiveJob[] = [
  {
    id: "job-001",
    employeeName: "David Miller",
    vehicle: "Toyota Camry",
    service: "Flat Tire",
    mechanic: "Mike Johnson",
    time: "10:20 AM",
    eta: "ETA: 15m",
    status: "En Route",
  },
  {
    id: "job-002",
    employeeName: "Jessica Wu",
    vehicle: "Tesla Model 3",
    service: "Battery Jump",
    mechanic: "Sarah Chen",
    time: "10:45 AM",
    eta: "ETA: 8m",
    status: "On Job",
  },
  {
    id: "job-003",
    employeeName: "Kevin Hart",
    vehicle: "Ford F-150",
    service: "Overheat",
    mechanic: "Robert Fox",
    time: "09:30 AM",
    eta: "ETA: Complete",
    status: "Finishing",
  },
  {
    id: "job-004",
    employeeName: "Lisa Ray",
    vehicle: "BMW X5",
    service: "Brake Lock",
    mechanic: "Unassigned",
    time: "Just now",
    eta: "ETA: --",
    status: "Pending",
  },
];

export const activeRequests: ActiveRequest[] = [
  {
    id: "request-001",
    mechanicName: "Mike Johnson",
    area: "Downtown",
    status: "ON JOB",
    vehicle: "Toyota Camry",
    indicatorClassName: "bg-brand-red",
  },
  {
    id: "request-002",
    mechanicName: "Sarah Chen",
    area: "Mission District",
    status: "AVAILABLE",
    vehicle: "None",
    indicatorClassName: "bg-emerald-500",
  },
  {
    id: "request-003",
    mechanicName: "Robert Fox",
    area: "SOMA",
    status: "BREAK",
    vehicle: "None",
    indicatorClassName: "bg-gray-300",
  },
  {
    id: "request-004",
    mechanicName: "Elena Rodriguez",
    area: "Home",
    status: "OFFLINE",
    vehicle: "None",
    indicatorClassName: "bg-gray-300",
  },
];

export const serviceDistribution: ServiceDistributionSegment[] = [
  { label: "Towing", value: "35%", colorClassName: "bg-brand-red" },
  { label: "Tire Change", value: "25%", colorClassName: "bg-blue-500" },
  { label: "Battery", value: "20%", colorClassName: "bg-emerald-600" },
  { label: "Diagnostics", value: "20%", colorClassName: "bg-amber-400" },
];
