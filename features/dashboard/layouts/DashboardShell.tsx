"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/features/dashboard/layouts/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/layouts/DashboardSidebar";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const { hasHydrated, logout, sidebarCollapsed, token, user } = useAuthStore();
  const isAuthorized = Boolean(user && token && isCompanyAdmin(user));

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user || !token) {
      router.replace("/sign-in");
      return;
    }

    if (!isCompanyAdmin(user)) {
      logout();
      router.replace("/sign-in");
    }
  }, [hasHydrated, logout, router, token, user]);

  if (!hasHydrated || !isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] text-brand-dark transition-colors dark:bg-[#121419] dark:text-white">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-red/25 border-t-brand-red" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-brand-dark transition-colors dark:bg-[#121419] dark:text-white">
      <DashboardSidebar />
      <div
        className={cn(
          "transition-[padding] duration-200",
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]",
        )}
      >
        <DashboardHeader />
        <section className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
