"use client";

import { DashboardHeader } from "@/features/dashboard/layouts/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/layouts/DashboardSidebar";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarCollapsed = useAuthStore((state) => state.sidebarCollapsed);

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
