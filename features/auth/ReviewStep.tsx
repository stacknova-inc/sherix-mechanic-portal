"use client";

import { Building2, CheckCircle2, FileText, Info, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitSignup } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

function displayFile(file: File | null | undefined, fallback: string) {
  return file?.name ?? fallback;
}

function SummaryCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { label: string; value: string; file?: boolean; checked?: boolean }[];
}) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-[#edf0f3] bg-white shadow-card">
      <header className="flex h-[62px] items-center gap-3 border-b border-[#eef0f3] bg-[#fbfcfc] px-6">
        <span className="flex size-9 items-center justify-center rounded-[8px] bg-[#ffe8ee] text-brand-red">
          {icon}
        </span>
        <h2 className="text-[15px] font-extrabold text-brand-dark">{title}</h2>
      </header>
      <div className="px-6 py-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-b border-[#eef0f3] py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#9aa1ad]">
              {row.label}
            </p>
            <p className="flex items-center gap-2 text-[13px] font-extrabold leading-5 text-brand-dark">
              {row.file ? <FileText className="size-3.5 shrink-0 text-brand-red" /> : null}
              {row.checked ? <CheckCircle2 className="size-3.5 shrink-0 text-brand-red" /> : null}
              <span className="truncate">{row.value || "Not provided"}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReviewStep() {
  const {
    formData,
    files,
    previousStep,
    loading,
    setLoading,
    setUser,
    setError,
    setSuccess,
  } = useAuthStore();
  const { toast } = useToast();

  const finalize = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await submitSignup(formData, files);
      setUser(response.user, response.token);
      setSuccess(response.message ?? "Account created successfully.");
      toast({ type: "success", message: response.message ?? "Account created successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      setError(message);
      toast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1040px] px-8 pb-16 pt-10">
      <div className="mb-9 mx-auto max-w-[720px]">
        <h1 className="text-center text-[30px] font-extrabold tracking-[-0.02em] text-brand-dark">
          Review Your Registration Summary
        </h1>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[14px] font-medium leading-6 text-[#8e8f94]">
          Confirm the details entered in the company and admin profile steps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SummaryCard
          title="Company Information"
          icon={<Building2 className="size-5" />}
          rows={[
            { label: "Company Name", value: formData.companyName },
            { label: "Business Email", value: formData.businessEmail },
            { label: "Company Number", value: formData.companyNumber },
            { label: "Coverage Area", value: formData.coverage_area },
            {
              label: "Registration Certificate",
              value: displayFile(files.registrationCertificate, "Uploaded"),
              file: true,
            },
            {
              label: "Proof of Garage/Workshop Address",
              value: displayFile(files.garageProof, "Uploaded"),
              file: true,
            },
            { label: "Bank / Momo Details", value: formData.bankDetails },
            {
              label: "Business Insurance",
              value: files.businessInsurance ? displayFile(files.businessInsurance, "Uploaded") : "Not uploaded",
              file: Boolean(files.businessInsurance),
            },
          ]}
        />

        <SummaryCard
          title="Admin Profile"
          icon={<UserRound className="size-5" />}
          rows={[
            { label: "Full Name", value: formData.fullName },
            { label: "Personal Email", value: formData.personalEmail },
            {
              label: "Ghana Card",
              value: displayFile(files.ghanaCard, "Uploaded"),
              file: true,
            },
            { label: "Services Offered", value: formData.servicesOffered },
            { label: "Working Hours", value: formData.workingHours },
            {
              label: "Insurance Upload",
              value: files.insuranceUpload ? displayFile(files.insuranceUpload, "Uploaded") : "Not uploaded",
              file: Boolean(files.insuranceUpload),
            },
            {
              label: "Signed Agreement",
              value: formData.signedAgreementAccepted ? "Read and accepted" : "Not accepted",
              checked: formData.signedAgreementAccepted,
            },
          ]}
        />
      </div>

      <section className="mt-8 rounded-[8px] border border-[#edf0f3] bg-[#fbfcfc] px-6 py-7">
        <div className="mx-auto flex max-w-[680px] items-start gap-4 text-[13px] font-medium leading-6 text-[#8b919a]">
          <Info className="mt-1 size-4 shrink-0 text-brand-dark" />
          <p>
            By confirming, you acknowledge that the information shown above is accurate.
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={previousStep}
            className="h-[48px] w-[180px] rounded-[8px] border border-[#d6dae1] bg-white text-[13px] font-extrabold text-brand-dark"
          >
            Previous Step
          </button>
          <button
            onClick={finalize}
            disabled={loading}
            className="flex h-[48px] w-[300px] max-w-full items-center justify-center gap-3 rounded-[8px] bg-brand-red text-[13px] font-extrabold text-white shadow-[0_14px_22px_rgba(228,7,47,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
            Finalize & Create Account <span className="text-[18px] leading-none">&rsaquo;</span>
          </button>
        </div>
      </section>
    </main>
  );
}
