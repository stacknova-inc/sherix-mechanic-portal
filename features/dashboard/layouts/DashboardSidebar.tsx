"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DASHBOARD_NAV_ITEMS, isActiveRoute } from "@/features/dashboard/constants/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  NOTIFICATION_PREVIEW_PARAMS,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/utils/cn";

export function DashboardSidebar() {
  const pathname = usePathname();
  const collapsed = useAuthStore((state) => state.sidebarCollapsed);
  const toggleCollapsed = useAuthStore((state) => state.toggleSidebarCollapsed);
  const { unreadCount } = useNotifications(NOTIFICATION_PREVIEW_PARAMS);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-[#eef0f3] bg-white py-6 transition-[width,background-color,border-color] duration-200 dark:border-white/10 dark:bg-[#17191f] lg:flex",
        collapsed ? "w-[76px] px-3" : "w-[260px] px-6",
      )}
    >
      <div className="mb-8 flex h-10 items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className={cn(
            "min-w-0 font-extrabold text-brand-red transition-all",
            collapsed ? "mx-auto text-[24px]" : "text-[28px]",
          )}
          title="Sherix"
        >
          {collapsed ? "S" : "Sherix"}
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden size-9 shrink-0 items-center justify-center rounded-lg text-[#737b88] transition hover:bg-[#f7f8fa] hover:text-brand-red dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white lg:flex",
            collapsed && "absolute right-3 top-6",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
      </div>

      <nav className="space-y-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);
          const badge =
            item.href === "/notifications"
              ? unreadCount > 0
                ? String(unreadCount)
                : undefined
              : item.badge;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg text-[13px] font-extrabold transition",
                isActive
                  ? "bg-brand-red text-white shadow-[0_10px_20px_rgba(228,7,47,0.24)]"
                  : "text-[#737b88] hover:bg-[#f7f8fa] hover:text-brand-dark dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white",
                collapsed ? "justify-center px-0" : "px-4",
              )}
            >
              <Icon className="size-4" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
              {badge ? (
                <span
                  className={cn(
                    "ml-auto flex size-5 items-center justify-center rounded-full text-[10px]",
                    isActive ? "bg-white text-brand-red" : "bg-brand-red text-white",
                    collapsed && "absolute ml-0 translate-x-3 -translate-y-3",
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <section
        className={cn(
          "mt-auto rounded-lg bg-[#f3f4f6] dark:bg-white/[0.04]",
          collapsed ? "p-2" : "p-4",
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#ffe5ec] text-brand-red">
          <HelpCircle className="size-4" />
        </span>
        {!collapsed ? (
          <>
            <p className="mt-3 text-[13px] font-extrabold dark:text-white">
              Support Center
            </p>
            <p className="mt-1 text-[10px] text-[#8f96a3]">Need assistance?</p>
            <Link
              href="/support"
              className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-white text-xs font-extrabold text-[#424956] transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:bg-white/10 dark:text-white"
            >
              Contact Help
            </Link>
          </>
        ) : null}
      </section>
    </aside>
  );
}
