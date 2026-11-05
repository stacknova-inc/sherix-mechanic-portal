import {
  BarChart3,
  Bell,
  HelpCircle,
  LayoutDashboard,
  ReceiptText,
  Scale,
  Settings,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import type { DashboardNavItem } from "@/features/dashboard/types/dashboard";

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employee", icon: UsersRound },
  { label: "Service Requests", href: "/requests", icon: Zap },
  { label: "Mechanic Performance", href: "/performance", icon: BarChart3 },
  { label: "Earnings & Transactions", href: "/earnings", icon: ReceiptText },
  { label: "Payouts", href: "/earnings/payouts", icon: WalletCards },
  { label: "Disputes", href: "/disputes", icon: Scale },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Support", href: "/support", icon: HelpCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/earnings") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
