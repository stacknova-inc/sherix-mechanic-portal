"use client";

import { CompanyStep } from "./CompanyStep";
import { AdminProfileStep } from "./AdminProfileStep";
import { ReviewStep } from "./ReviewStep";
import { VerificationPending } from "./VerificationPending";
import { AdminSetupFooter, AdminSetupTopbar } from "./AuthShell";
import { StepIndicator } from "./StepIndicator";
import { useAuthStore } from "@/store/auth-store";

export function SignupContainer() {
  const currentStep = useAuthStore((state) => state.currentStep);
  const success = useAuthStore((state) => state.success);

  if (success) {
    return <VerificationPending />;
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-white transition-colors dark:bg-[#121419]">
        <AdminSetupTopbar wide />
        <div className="pt-14">
          <StepIndicator currentStep={currentStep} />
          <ReviewStep />
        </div>
        <footer className="flex min-h-[112px] items-center border-t border-[#edf0f3] px-[11.5%] text-[14px] font-medium text-[#9aa1ad] transition-colors dark:border-white/10 dark:text-white/50">
          <div className="flex items-center gap-3 text-brand-red">
            <span className="font-extrabold">Sherix</span>
          </div>
          <span className="ml-6">© 2024 Sherix Technologies. All Rights Reserved.</span>
          <nav className="ml-auto flex gap-12 text-[12px] font-extrabold uppercase tracking-[0.16em]">
            <a>Help Center</a>
            <a>Privacy</a>
          </nav>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] transition-colors dark:bg-[#121419]">
      <AdminSetupTopbar />
      <main className="flex flex-1 flex-col items-center px-5 pb-8 pt-12">
        <section className="w-full max-w-[820px] rounded-[10px] border border-[#eceff3] bg-white px-8 pb-8 pt-8 shadow-auth transition-colors dark:border-white/10 dark:bg-[#1b1d22] md:px-[104px]">
          <StepIndicator currentStep={currentStep} />
          {currentStep === 1 ? <CompanyStep /> : <AdminProfileStep />}
        </section>
        <div className="mt-8 flex items-center gap-2 text-[10px] font-medium text-[#a1a8b1] dark:text-white/45">
          <span className="size-1.5 rounded-full bg-brand-red" />
          {currentStep === 1 ? "Your data is encrypted and secure with Admin Setup Portal." : "ENTERPRISE GRADE SECURITY GUARANTEED"}
        </div>
      </main>
      <AdminSetupFooter compact={currentStep === 2} />
    </div>
  );
}
