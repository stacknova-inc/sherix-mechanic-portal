"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Globe2, Hash, Users } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { companySchema, type CompanyFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";
import { TextField, UploadField } from "./FormControls";

export function CompanyStep() {
  const { formData, files, setFormData, setFile, nextStep } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
    defaultValues: {
      ...formData,
      registrationCertificate: files.registrationCertificate ?? undefined,
      garageProof: files.garageProof ?? undefined,
      businessInsurance: files.businessInsurance ?? undefined,
    },
  });

  const onSubmit = (values: CompanyFormValues) => {
    console.info("[Auth][Signup][CompanyStep] Step submitted", {
      companyName: values.companyName.trim(),
      registrationNumber: values.registrationNumber.trim(),
      coverageArea: values.coverage_area.trim(),
      personnelCount: values.personnelCount.trim(),
      files: {
        registrationCertificate: values.registrationCertificate.name,
        garageProof: values.garageProof.name,
        businessInsurance: values.businessInsurance.name,
      },
    });
    setFormData(values);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-brand-dark dark:text-white">
          Company Information
        </h1>
        <p className="mt-2 text-[12px] font-medium text-[#8f96a3] dark:text-white/55">
          Provide your business details to customize your administrative workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <TextField label="Company Name" placeholder="e.g. Acme Corp" required icon={Building2} registration={register("companyName")} error={errors.companyName} />
        <TextField label="Registration Number" placeholder="e.g. RC-123456" required icon={Hash} registration={register("registrationNumber")} error={errors.registrationNumber} />
        <TextField label="Coverage Area" placeholder="e.g. Greater Accra" required icon={Globe2} registration={register("coverage_area")} error={errors.coverage_area} />
        <TextField label="Personnel Count" placeholder="e.g. 20" type="number" required icon={Users} registration={register("personnelCount")} error={errors.personnelCount} />
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

      

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <UploadField
          label="Business Insurance"
          placeholder="Upload Insurance PDF"
          required
          icon="file"
          file={files.businessInsurance}
          error={errors.businessInsurance}
          onChange={(file) => {
            setFile("businessInsurance", file);
            setValue("businessInsurance", file as CompanyFormValues["businessInsurance"], { shouldValidate: true });
          }}
        />
      </div>

      <div className="mt-7 border-t border-[#edf0f3] pt-5 dark:border-white/10">
        <button type="submit" className="ml-auto flex h-[42px] w-[96px] items-center justify-center gap-2 rounded-[8px] bg-brand-red text-[12px] font-extrabold text-white shadow-[0_12px_22px_rgba(228,7,47,0.14)]">
          Next <span className="text-[16px] leading-none">&rsaquo;</span>
        </button>
      </div>
    </form>
  );
}
