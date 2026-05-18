"use client";

import Link from "next/link";
import { Bell, Grid2X2, Search, Settings } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#eef0f3] bg-white/95 px-5 backdrop-blur md:px-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[22px] font-extrabold text-brand-red lg:hidden"
      >
        <Grid2X2 className="size-5" />
        Sherix
      </Link>

      <label className="relative hidden w-full max-w-[360px] sm:block">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]" />
        <input
          className="h-10 w-full rounded-full border border-[#eff1f4] bg-white pl-11 pr-4 text-sm font-medium outline-none placeholder:text-[#8f96a3] focus:border-brand-red focus:ring-4 focus:ring-red-50"
          placeholder="Search customers, vehicles, or mechanics..."
        />
      </label>

      <span className="ml-auto hidden h-8 items-center rounded-full border border-[#eff1f4] px-5 text-xs font-extrabold md:flex">
        Online Mechanics: 8
      </span>

      <Link
        href="/notifications"
        aria-label="Open notifications"
        className="relative flex size-9 items-center justify-center rounded-full border border-[#eff1f4] transition hover:border-brand-red hover:text-brand-red"
      >
        <Bell className="size-4" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-red" />
      </Link>
      <Link
        href="/settings"
        aria-label="Open settings"
        className="flex size-9 items-center justify-center rounded-full border border-[#eff1f4] transition hover:border-brand-red hover:text-brand-red"
      >
        <Settings className="size-4" />
      </Link>

      <div className="hidden items-center gap-3 md:flex">
        <div className="text-right">
          <p className="text-sm font-extrabold">Graca Yakey</p>
          <p className="text-[10px] text-[#8f96a3]">Operations Lead</p>
        </div>
        <div className="size-9 rounded-full bg-[linear-gradient(135deg,#d7c0a4,#5d6b58)] shadow-inner" />
      </div>
    </header>
  );
}
