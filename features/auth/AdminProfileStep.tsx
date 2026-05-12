"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Clock3, FileText, LockKeyhole, Mail, X, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { adminSchema, type AdminFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";
import { TextField, UploadField } from "./FormControls";

export function AdminProfileStep() {
  const [agreementOpen, setAgreementOpen] = useState(false);
  const { formData, files, setFormData, setFile, nextStep, previousStep } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      ...formData,
      ghanaCard: files.ghanaCard ?? undefined,
      insuranceUpload: files.insuranceUpload ?? null,
    },
  });

  const onSubmit = (values: AdminFormValues) => {
    setFormData(values);
    nextStep();
  };
  const agreementAccepted = watch("signedAgreementAccepted");
  const agreementRegistration = register("signedAgreementAccepted");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-brand-dark">
          Create Admin Profile
        </h1>
        <p className="mt-2 text-[12px] font-medium text-[#8f96a3]">
          Enter the credentials for the primary administrator account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <TextField label="Full Name" placeholder="John Doe" icon={UserRound} registration={register("fullName")} error={errors.fullName} />
        <TextField label="Personal Email" placeholder="john@example.com" icon={Mail} registration={register("personalEmail")} error={errors.personalEmail} />
        <TextField label="Admin Password" placeholder="Enter password" type="password" icon={LockKeyhole} registration={register("password")} error={errors.password} isPassword />
        <TextField label="Confirm Password" placeholder="Confirm password" type="password" icon={LockKeyhole} registration={register("confirmPassword")} error={errors.confirmPassword} isPassword />
        <UploadField
          label="ID Upload - Ghana Card"
          placeholder="Upload Ghana Card"
          required
          icon="file"
          file={files.ghanaCard}
          error={errors.ghanaCard}
          onChange={(file) => {
            setFile("ghanaCard", file);
            setValue("ghanaCard", file as File, { shouldValidate: true });
          }}
        />
        <TextField label="Services Offered" placeholder="Express Delivery, Heavy Cargo" icon={BriefcaseBusiness} registration={register("servicesOffered")} error={errors.servicesOffered} />
        <TextField label="Working Hours" placeholder="Mon - Sat | 08:00 AM - 09:00 PM" icon={Clock3} registration={register("workingHours")} error={errors.workingHours} />
        <UploadField
          label="Insurance Upload"
          placeholder="Upload Insurance PDF"
          optional
          icon="file"
          file={files.insuranceUpload}
          error={errors.insuranceUpload}
          onChange={(file) => {
            setFile("insuranceUpload", file);
            setValue("insuranceUpload", file, { shouldValidate: true });
          }}
        />
      </div>

      <label className="mt-6 flex min-h-[70px] items-start gap-3 rounded-[8px] border border-[#eef0f3] bg-[#fafafa] px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-[#9da4ae] text-brand-red focus:ring-brand-red"
          name={agreementRegistration.name}
          ref={agreementRegistration.ref}
          onBlur={agreementRegistration.onBlur}
          checked={agreementAccepted}
          onChange={(event) => {
            event.preventDefault();
            setAgreementOpen(true);
          }}
        />
        <span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setAgreementOpen(true);
            }}
            className="block text-left text-[11px] font-extrabold text-[#363b44] underline decoration-[#d8dce3] underline-offset-2"
          >
            Read and accept the signed agreement
          </button>
          <span className="mt-1 block max-w-[550px] text-[10px] font-medium leading-4 text-[#8c94a0]">
            Open the agreement to review the setup responsibilities before ticking this box.
          </span>
          {errors.signedAgreementAccepted ? <span className="auth-error">{errors.signedAgreementAccepted.message}</span> : null}
        </span>
      </label>

      <div className="mt-7 flex items-center justify-between border-t border-[#edf0f3] pt-5">
        <button type="button" onClick={previousStep} className="flex h-[38px] items-center gap-2 px-2 text-[12px] font-semibold text-brand-dark">
          <span className="text-[16px] leading-none">&lsaquo;</span> Back
        </button>
        <button type="submit" className="flex h-[38px] w-[128px] items-center justify-center rounded-[8px] bg-brand-red text-[12px] font-extrabold text-white">
          Review
        </button>
      </div>

      {agreementOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[560px] rounded-[10px] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.2)]">
            <div className="flex h-[58px] items-center gap-3 border-b border-[#edf0f3] px-5">
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#ffe8ee] text-brand-red">
                <FileText className="size-4" />
              </span>
              <h2 className="text-[15px] font-extrabold text-brand-dark">Signed Agreement</h2>
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="ml-auto flex size-8 items-center justify-center rounded-full text-[#8f96a3] hover:bg-[#f5f6f8]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto px-5 py-4 text-[12px] font-medium leading-6 text-[#5f6672]">
              <p className="mb-3">
                By accepting this agreement, the administrator confirms that the provided business and identity information is accurate and belongs to the company being registered.
              </p>
              <p className="mb-3">
                The administrator is responsible for maintaining correct service information, working hours, uploaded documents, and account access credentials.
              </p>
              <p className="mb-3">
                Uploaded documents may be reviewed for verification before the account is fully activated. Any false or incomplete information may delay approval.
              </p>
              <p>
                Acceptance of this agreement authorizes Sherix Admin to use the submitted information for onboarding, compliance checks, and account setup.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#edf0f3] px-5 py-4">
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#dfe3e9] px-4 text-[12px] font-extrabold text-brand-dark"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("signedAgreementAccepted", true, { shouldValidate: true });
                  setAgreementOpen(false);
                }}
                className="h-[38px] rounded-[8px] bg-brand-red px-5 text-[12px] font-extrabold text-white"
              >
                I Accept Agreement
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
