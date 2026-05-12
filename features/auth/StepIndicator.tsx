import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SignupStep } from "@/types/auth";

const steps = [
  { id: 1, label: "Company" },
  { id: 2, label: "Admin Profile" },
  { id: 3, label: "Review" }
] as const;

export function StepIndicator({ currentStep, reviewStyle = false }: { currentStep: SignupStep; reviewStyle?: boolean }) {
  if (reviewStyle) {
    return (
      <div className="mx-auto grid w-[560px] max-w-full grid-cols-3 gap-12">
        {steps.map((step) => {
          const completed = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border text-[15px] font-extrabold",
                  active && "border-brand-red bg-brand-red text-white shadow-[0_8px_18px_rgba(228,7,47,0.18)]",
                  completed && "border-[#d9dde4] bg-white text-brand-dark",
                  !active && !completed && "border-[#e5e8ee] bg-white text-[#a1a7b0]"
                )}
              >
                {completed ? <Check className="size-5" /> : step.id}
              </span>
              <span className={cn("text-[12px] font-extrabold uppercase text-[#9aa1ad]", active && "text-brand-red")}>
                {step.id === 1 ? "Company Info" : step.id === 2 ? "Admin Profile" : "Review & Confirm"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-7 flex items-center justify-center">
      {steps.map((step, index) => {
        const active = step.id <= currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <span
              className={cn(
                "flex size-[26px] items-center justify-center rounded-full text-[11px] font-bold",
                active ? "bg-brand-red text-white" : "border border-[#dfe3e9] bg-white text-[#aab1bb]"
              )}
            >
              {step.id}
            </span>
            <span className={cn("ml-2 text-[11px] font-semibold", active ? "text-brand-dark" : "text-[#98a0ab]")}>
              {step.label}
            </span>
            {index < steps.length - 1 ? <span className="mx-3 h-px w-[36px] bg-[#e4e7ec]" /> : null}
          </div>
        );
      })}
    </div>
  );
}
