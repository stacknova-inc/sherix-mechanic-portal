"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, Check, Clock3, FileText, LockKeyhole, Mail, X, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { adminSchema, type AdminFormValues } from "@/features/auth/schemas";
import { normalizeServiceIds } from "./service-utils";
import { getApiErrorDetails } from "@/services/api-error";
import { getPublicServices } from "@/services/services-service";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";
import { TextField, UploadField } from "./FormControls";

export function AdminProfileStep() {
  const [agreementOpen, setAgreementOpen] = useState(false);
  const { toast } = useToast();
  const servicesQuery = useQuery({
    queryKey: ["active-services", "auth"],
    queryFn: getPublicServices,
    staleTime: 5 * 60 * 1000,
  });
  const { formData, files, setFormData, setFile, nextStep, previousStep } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema) as Resolver<AdminFormValues>,
    defaultValues: {
      ...formData,
      ghanaCard: files.ghanaCard ?? undefined,
      insuranceUpload: files.insuranceUpload ?? undefined,
    },
  });

  const onSubmit = (values: AdminFormValues) => {
    console.info("[Auth][Signup][AdminStep] Step submitted", {
      fullName: values.fullName.trim(),
      personalEmail: values.personalEmail.trim(),
      serviceIds: normalizeServiceIds(values.servicesOffered),
      workingHours: values.workingHours.trim(),
      signedAgreementAccepted: values.signedAgreementAccepted,
      password: values.password ? "[present]" : "[missing]",
      confirmPassword: values.confirmPassword ? "[present]" : "[missing]",
      files: {
        ghanaCard: values.ghanaCard.name,
        adminInsurance: values.insuranceUpload.name,
      },
    });
    setFormData(values);
    nextStep();
  };
  const agreementAccepted = watch("signedAgreementAccepted");
  const selectedServices = normalizeServiceIds(watch("servicesOffered"));
  const agreementRegistration = register("signedAgreementAccepted");

  useEffect(() => {
    if (servicesQuery.isError) {
      const details = getApiErrorDetails(
        servicesQuery.error,
        "Unable to load active services.",
      );
      console.error("[Services] Services failed to load", details);
      toast({
        type: "error",
        message: `${details.message} (${details.reason.replaceAll("_", " ")})`,
      });
    }
  }, [servicesQuery.error, servicesQuery.isError, toast]);

  const toggleService = (serviceId: string) => {
    const nextServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setValue("servicesOffered", nextServices, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-brand-dark dark:text-white">
          Create Admin Profile
        </h1>
        <p className="mt-2 text-[12px] font-medium text-[#8f96a3] dark:text-white/55">
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
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <BriefcaseBusiness className="size-[14px] text-[#9ba3ae]" />
            <span className="auth-label mb-0">Services <span className="text-brand-red">*</span></span>
          </div>
          {servicesQuery.isLoading ? (
            <div className="rounded-[8px] border border-[#dfe3e9] bg-white px-3 py-4 text-[12px] font-semibold text-[#687181] dark:border-white/10 dark:bg-[#202329] dark:text-white/60">
              Loading services...
            </div>
          ) : servicesQuery.isError ? (
            <div className="rounded-[8px] border border-brand-red bg-[#fff4f6] px-3 py-4 text-[12px] font-semibold text-brand-red">
              Unable to load active services. Check the console for request details.
            </div>
          ) : !servicesQuery.data?.length ? (
            <div className="rounded-[8px] border border-[#dfe3e9] bg-white px-3 py-4 text-[12px] font-semibold text-[#687181] dark:border-white/10 dark:bg-[#202329] dark:text-white/60">
              No active services are available right now.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {servicesQuery.data.map((service) => {
              const selected = selectedServices.includes(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "flex min-h-[48px] items-center gap-3 rounded-[8px] border bg-white px-3 text-left transition dark:bg-[#202329]",
                    selected
                      ? "border-brand-red bg-[#fff4f6] text-brand-dark shadow-[0_10px_18px_rgba(228,7,47,0.08)] dark:bg-brand-red/10 dark:text-white"
                      : "border-[#dfe3e9] text-[#687181] hover:border-brand-red dark:border-white/10 dark:text-white/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-brand-red bg-brand-red text-white"
                        : "border-[#cfd4dc] bg-white text-transparent dark:border-white/20 dark:bg-transparent",
                    )}
                  >
                    <Check className="size-3.5" />
                  </span>
                  <span>
                    <span className="block text-[12px] font-extrabold">{service.name}</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-[#9aa1ad]">
                      {service.id}
                    </span>
                  </span>
                </button>
              );
              })}
            </div>
          )}
          {errors.servicesOffered ? (
            <span className="auth-error">{errors.servicesOffered.message}</span>
          ) : null}
        </div>
        <TextField label="Working Hours" placeholder="8" icon={Clock3} registration={register("workingHours")} error={errors.workingHours} />
        <UploadField
          label="Insurance Upload"
          placeholder="Upload Insurance PDF"
          required
          icon="file"
          file={files.insuranceUpload}
          error={errors.insuranceUpload}
          onChange={(file) => {
            setFile("insuranceUpload", file);
            setValue("insuranceUpload", file as AdminFormValues["insuranceUpload"], { shouldValidate: true });
          }}
        />
      </div>

      <label className="mt-6 flex min-h-[70px] items-start gap-3 rounded-[8px] border border-[#eef0f3] bg-[#fafafa] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
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
            className="block text-left text-[11px] font-extrabold text-[#363b44] underline decoration-[#d8dce3] underline-offset-2 dark:text-white"
          >
            Read and accept the signed agreement
          </button>
          <span className="mt-1 block max-w-[550px] text-[10px] font-medium leading-4 text-[#8c94a0] dark:text-white/50">
            Open the agreement to review the setup responsibilities before ticking this box.
          </span>
          {errors.signedAgreementAccepted ? <span className="auth-error">{errors.signedAgreementAccepted.message}</span> : null}
        </span>
      </label>

      <div className="mt-7 flex items-center justify-between border-t border-[#edf0f3] pt-5 dark:border-white/10">
        <button type="button" onClick={previousStep} className="flex h-[38px] items-center gap-2 px-2 text-[12px] font-semibold text-brand-dark dark:text-white">
          <span className="text-[16px] leading-none">&lsaquo;</span> Back
        </button>
        <button type="submit" className="flex h-[38px] w-[128px] items-center justify-center rounded-[8px] bg-brand-red text-[12px] font-extrabold text-white">
          Review
        </button>
      </div>

      {agreementOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[560px] rounded-[10px] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.2)] dark:bg-[#1b1d22]">
            <div className="flex h-[58px] items-center gap-3 border-b border-[#edf0f3] px-5 dark:border-white/10">
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#ffe8ee] text-brand-red">
                <FileText className="size-4" />
              </span>
              <h2 className="text-[15px] font-extrabold text-brand-dark dark:text-white">Signed Agreement</h2>
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="ml-auto flex size-8 items-center justify-center rounded-full text-[#8f96a3] hover:bg-[#f5f6f8]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto px-5 py-4 text-[12px] font-medium leading-6 text-[#5f6672] dark:text-white/65">
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
            <div className="flex items-center justify-end gap-3 border-t border-[#edf0f3] px-5 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#dfe3e9] px-4 text-[12px] font-extrabold text-brand-dark dark:border-white/10 dark:text-white"
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
