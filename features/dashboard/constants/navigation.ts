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
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Earnings & Payouts", href: "/earnings", icon: WalletCards },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: "4" },
  { label: "Settings", href: "/settings", icon: Settings },
];
