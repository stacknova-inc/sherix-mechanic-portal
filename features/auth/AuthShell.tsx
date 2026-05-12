import { ShieldCheck } from "lucide-react";

export function AdminSetupTopbar({ wide = false }: { wide?: boolean }) {
  return (
    <header className="flex h-[56px] w-full items-center justify-center border-b border-[#eef0f3] bg-white">
      <div className={wide ? "flex w-full max-w-[1860px] items-center justify-between px-14" : "flex w-full items-center justify-center px-8"}>
        <div className="flex items-center gap-2 text-[17px] font-extrabold text-brand-red">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-red text-white">
            <ShieldCheck className="size-4" />
          </span>
          <span>{wide ? "Sherix Admin" : "Admin Setup"}</span>
        </div>
        {wide ? (
          <nav className="ml-9 mr-auto flex items-center gap-8 text-[15px] font-semibold text-[#333842]">
            <a>Setup Guide</a>
            <a>Support</a>
            <a>Policy</a>
          </nav>
        ) : null}
        <span className={wide ? "hidden" : "absolute right-9 text-[12px] font-medium text-[#8f96a3]"}>
          Support
        </span>
      </div>
    </header>
  );
}

export function AdminSetupFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="flex min-h-[64px] flex-col items-center justify-center border-t border-[#edf0f3] bg-white text-[12px] font-medium text-[#9aa1ad]">
      <p>{compact ? "© 2026 Admin Setup Portal. All rights reserved." : "© 2026 Admin Setup Portal. All rights reserved."}</p>
      {compact ? (
        <div className="mt-2 flex gap-7">
          <a>Privacy Policy</a>
        </div>
      ) : null}
    </footer>
  );
}
