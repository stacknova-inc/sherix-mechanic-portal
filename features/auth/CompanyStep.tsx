"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Globe2, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { companySchema, type CompanyFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";
import { TextAreaField, TextField, UploadField } from "./FormControls";

export function CompanyStep() {
  const { formData, files, setFormData, setFile, nextStep } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      ...formData,
      registrationCertificate: files.registrationCertificate ?? undefined,
      garageProof: files.garageProof ?? undefined,
      businessInsurance: files.businessInsurance ?? null,
    },
  });

  const onSubmit = (values: CompanyFormValues) => {
    setFormData(values);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-brand-dark">
          Company Information
        </h1>
        <p className="mt-2 text-[12px] font-medium text-[#8f96a3]">
          Provide your business details to customize your administrative workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <TextField label="Company Name" placeholder="e.g. Acme Corp" required icon={Building2} registration={register("companyName")} error={errors.companyName} />
        <TextField label="Business Email" placeholder="name@company.com" required icon={Mail} registration={register("businessEmail")} error={errors.businessEmail} />
        <TextField label="Company Number" placeholder="+1 (555) 000-0000" required icon={Phone} registration={register("companyNumber")} error={errors.companyNumber} />
        <TextField label="Coverage Area" placeholder="e.g. Greater Accra" required icon={Globe2} registration={register("coverage_area")} error={errors.coverage_area} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <UploadField
          label="Business Registration Certificate"
          placeholder="Upload Document"
          required
          file={files.registrationCertificate}
          error={errors.registrationCertificate}
          onChange={(file) => {
            setFile("registrationCertificate", file);
            setValue("registrationCertificate", file as File, { shouldValidate: true });
          }}
        />
        <UploadField
          label="Proof of Garage/Workshop Address"
          placeholder="Upload Utility Bill/Lease"
          required
          icon="file"
          file={files.garageProof}
          error={errors.garageProof}
          onChange={(file) => {
            setFile("garageProof", file);
            setValue("garageProof", file as File, { shouldValidate: true });
          }}
        />
      </div>

      <div className="mt-5">
        <TextAreaField
          label="Company Bank Account / Momo Details"
          placeholder="Enter bank name, account number, account name or momo number..."
          required
          registration={register("bankDetails")}
          error={errors.bankDetails}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <UploadField
          label="Business Insurance"
          placeholder="Upload Insurance PDF"
          optional
          icon="file"
          file={files.businessInsurance}
          error={errors.businessInsurance}
          onChange={(file) => {
            setFile("businessInsurance", file);
            setValue("businessInsurance", file, { shouldValidate: true });
          }}
        />
      </div>

      <div className="mt-7 border-t border-[#edf0f3] pt-5">
        <button type="submit" className="ml-auto flex h-[42px] w-[96px] items-center justify-center gap-2 rounded-[8px] bg-brand-red text-[12px] font-extrabold text-white shadow-[0_12px_22px_rgba(228,7,47,0.14)]">
          Next <span className="text-[16px] leading-none">&rsaquo;</span>
        </button>
      </div>
    </form>
  );
}
