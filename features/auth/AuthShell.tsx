import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

export function AdminSetupTopbar({ wide = false }: { wide?: boolean }) {
  return (
    <header className="flex h-[56px] w-full items-center justify-center border-b border-[#eef0f3] bg-white transition-colors dark:border-white/10 dark:bg-[#17191f]">
      <div className={wide ? "flex w-full max-w-[1860px] items-center justify-between px-14" : "flex w-full items-center justify-between px-8"}>
        <span className="size-9" aria-hidden />
        <div className="flex items-center gap-2 text-[17px] font-extrabold text-brand-red">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-red text-white">
            <ShieldCheck className="size-4" />
          </span>
          <span>{wide ? "Sherix Admin" : "Admin Setup"}</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function AdminSetupFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="flex min-h-[64px] flex-col items-center justify-center border-t border-[#edf0f3] bg-white text-[12px] font-medium text-[#9aa1ad] transition-colors dark:border-white/10 dark:bg-[#17191f] dark:text-white/50">
      <p>{compact ? "© 2026 Admin Setup Portal. All rights reserved." : "© 2026 Admin Setup Portal. All rights reserved."}</p>
      {compact ? (
        <div className="mt-2 flex gap-7">
          <a>Privacy Policy</a>
        </div>
      ) : null}
    </footer>
  );
}
