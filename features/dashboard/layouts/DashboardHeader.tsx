"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Grid2X2,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useAuthStore } from "@/store/auth-store";

export function DashboardHeader() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || "Sherix Admin";
  const displayRole = user?.role || "company_admin";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLogout() {
    setProfileMenuOpen(false);
    logout();
    router.replace("/sign-in");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#eef0f3] bg-white/95 px-5 backdrop-blur transition-colors dark:border-white/10 dark:bg-[#17191f]/95 md:px-8">
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
          className="h-10 w-full rounded-full border border-[#eff1f4] bg-white pl-11 pr-4 text-sm font-medium outline-none placeholder:text-[#8f96a3] focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-red-950/30"
          placeholder="Search customers, vehicles, or mechanics..."
        />
      </label>

      <div className="ml-auto flex justify-between items-center gap-5">
      <ThemeToggle />

      <Link
        href="/notifications"
        aria-label="Open notifications"
        className="relative flex size-9 items-center justify-center rounded-full border border-[#eef0f3] bg-white text-[#6f7784] transition hover:border-brand-red hover:text-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/70"
      >
        <Bell className="size-4" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-red" />
      </Link>
      

      <div ref={profileMenuRef} className="relative">
        <button
          type="button"
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          aria-label="Open profile menu"
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="flex items-center gap-2 rounded-full border border-transparent p-1 transition md:gap-3"
        >
          <span className="hidden text-right md:block">
            <span className="block text-sm font-extrabold leading-4 dark:text-white">{displayName}</span>
            <span className="block text-[10px] font-medium text-[#8f96a3]">
              {displayRole}
            </span>
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e4072f,#f8c3cd)] text-[12px] font-extrabold text-white shadow-[0_10px_18px_rgba(228,7,47,0.18)]">
            {initials || "SA"}
          </span>
        </button>

        {profileMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 w-32 m-2 rounded-[8px] bg-white p-2 shadow-[0_18px_45px_rgba(17,24,39,0.12)] dark:bg-[#202329]"
          >
            <div className="border-b border-[#f0f2f5] px-3 py-2 dark:border-white/10 md:hidden">
              <p className="truncate text-sm font-extrabold text-brand-dark dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-[11px] font-medium text-[#8f96a3]">
                {displayRole}
              </p>
            </div>
            <Link
              href="/settings"
              role="menuitem"
              className="mt-1 flex h-10 items-center gap-3 rounded-lg px-3 text-[12px] font-extrabold text-[#5f6672] transition hover:bg-[#f7f8fa] hover:text-brand-dark dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <UserRound className="size-4 text-brand-red" />
              Profile 
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-extrabold text-brand-red transition hover:bg-[#fff4f6] dark:hover:bg-brand-red/10"
            >
              <LogOut className="size-4" />
              Log Out
            </button>
          </div>
        ) : null}
      </div>
      </div>
    </header>
  );
}
