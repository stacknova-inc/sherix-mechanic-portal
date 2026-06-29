import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Settings,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import type { DashboardNavItem } from "@/features/dashboard/types/dashboard";

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employee", icon: UsersRound },
  { label: "Requests", href: "/requests", icon: Zap },
  { label: "Earnings & Payouts", href: "/earnings", icon: WalletCards },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];
