"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { cn } from "@/utils/cn";

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] flex-col border-r border-[#eef0f3] bg-white px-6 py-6 lg:flex">
      <Link
        href="/dashboard"
        className="mb-8 text-[28px] font-extrabold text-brand-red"
      >
        Sherix
      </Link>
      <nav className="space-y-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-4 text-[13px] font-extrabold transition",
                isActive
                  ? "bg-brand-red text-white shadow-[0_10px_20px_rgba(228,7,47,0.24)]"
                  : "text-[#737b88] hover:bg-[#f7f8fa] hover:text-brand-dark",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "ml-auto flex size-5 items-center justify-center rounded-full text-[10px]",
                    isActive ? "bg-white text-brand-red" : "bg-brand-red text-white",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <section className="mt-auto rounded-lg bg-[#f3f4f6] p-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#ffe5ec] text-brand-red">
          <HelpCircle className="size-4" />
        </span>
        <p className="mt-3 text-[13px] font-extrabold">Support Center</p>
        <p className="mt-1 text-[10px] text-[#8f96a3]">Need assistance?</p>
        <button className="mt-4 h-9 w-full rounded-lg bg-white text-xs font-extrabold text-[#424956] transition hover:text-brand-red">
          Contact Help
        </button>
      </section>
    </aside>
  );
}
