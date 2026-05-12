import { cn } from "@/utils/cn";
import type { SignupStep } from "@/types/auth";

const steps = [
  { id: 1, label: "Company" },
  { id: 2, label: "Admin Profile" },
  { id: 3, label: "Review" }
] as const;

export function StepIndicator({ currentStep }: { currentStep: SignupStep }) {
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
