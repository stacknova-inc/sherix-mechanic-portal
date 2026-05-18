import { DashboardHeader } from "@/features/dashboard/layouts/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/layouts/DashboardSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-brand-dark">
      <DashboardSidebar />
      <div className="lg:pl-[260px]">
        <DashboardHeader />
        <section className="mx-auto max-w-[1380px] px-5 py-8 md:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
