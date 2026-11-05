"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DASHBOARD_NAV_ITEMS, isActiveRoute } from "@/features/dashboard/constants/navigation";
import {
  NOTIFICATION_PREVIEW_PARAMS,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/utils/cn";

/**
 * Below the `lg` breakpoint the sidebar is hidden, so the header shows this
 * menu with the same navigation items.
 */
export function MobileNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications(NOTIFICATION_PREVIEW_PARAMS);

  // Close after navigating.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
        className="flex size-9 items-center justify-center rounded-lg text-[#6f7784] transition hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white/70 dark:hover:bg-white/10"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-black/30" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            id="mobile-navigation"
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[#eef0f3] bg-white p-3 shadow-lg dark:border-white/10 dark:bg-[#17191f]"
          >
            <nav aria-label="Main">
              <ul className="space-y-1">
                {DASHBOARD_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);
                  const badge = item.href === "/notifications" && unreadCount > 0 ? unreadCount : null;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                          active
                            ? "bg-brand-red text-white"
                            : "text-[#596170] hover:bg-[#f7f8fa] dark:text-white/70 dark:hover:bg-white/10",
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                        {badge ? (
                          <span className={cn("ml-auto rounded-full px-2 text-[11px]", active ? "bg-white text-brand-red" : "bg-brand-red text-white")}>
                            {badge}
                            <span className="sr-only"> unread</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
