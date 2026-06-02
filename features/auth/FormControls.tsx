"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { ChevronDown, Eye, FileText, Upload, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type TextFieldProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  icon: LucideIcon;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  isPassword?: boolean;
};

export function TextField({
  label,
  placeholder,
  required,
  type = "text",
  icon: Icon,
  registration,
  error,
  isPassword
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="auth-label">
        {label} {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[14px] -translate-y-1/2 text-[#9ba3ae]" />
        <input className={cn("auth-input", error && "border-brand-red")} type={type} placeholder={placeholder} {...registration} />
        {isPassword ? (
          <Eye className="pointer-events-none absolute right-3.5 top-1/2 size-[14px] -translate-y-1/2 text-[#8f96a3]" />
        ) : null}
      </span>
      {error ? <span className="auth-error">{error.message}</span> : null}
    </label>
  );
}

type UploadFieldProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  error?: FieldError;
  file?: File | null;
  onChange: (file: File | null) => void;
  icon?: "upload" | "file" | "shield";
};

export function UploadField({
  label,
  placeholder,
  required,
  optional,
  error,
  file,
  onChange,
  icon = "upload"
}: UploadFieldProps) {
  const Icon = icon === "upload" ? Upload : FileText;

  return (
    <label className="block">
      <span className="auth-label">
        {label} {required ? <span className="text-brand-red">*</span> : null}
        {optional ? <span className="ml-1 text-[10px] font-medium text-[#a5abb4]">(Optional)</span> : null}
      </span>
      <span className={cn("relative flex h-[40px] cursor-pointer items-center rounded-[8px] border border-[#dfe3e9] bg-white px-3 text-[12px] font-medium text-[#9ba3ae] transition dark:border-white/10 dark:bg-[#202329] dark:text-white/50", error && "border-brand-red")}>
        <span className="truncate pr-8">{file?.name ?? placeholder}</span>
        <Icon className="absolute right-3.5 size-[14px] text-[#9ba3ae]" />
        <input
          className="sr-only"
          type="file"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </span>
      {file ? <span className="mt-1 block text-[10px] font-semibold text-[#687181] dark:text-white/55">Ready to upload</span> : null}
      {error ? <span className="auth-error">{error.message}</span> : null}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  icon: LucideIcon;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  options: string[];
};

export function SelectField({ label, placeholder, required, icon: Icon, registration, error, options }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="auth-label">
        {label} {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[14px] -translate-y-1/2 text-[#9ba3ae]" />
        <select className={cn("auth-input appearance-none", error && "border-brand-red")} defaultValue="" {...registration}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-[14px] -translate-y-1/2 text-[#9ba3ae]" />
      </span>
      {error ? <span className="auth-error">{error.message}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  rows?: number;
};

export function TextAreaField({ label, placeholder, required, registration, error, rows = 4 }: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="auth-label">
        {label} {required ? <span className="text-brand-red">*</span> : null}
      </span>
      <textarea
        className={cn(
          "min-h-[72px] w-full resize-none rounded-[8px] border border-[#dfe3e9] bg-white px-3 py-2.5 text-[12px] font-medium text-brand-dark outline-none transition placeholder:text-[#9ba3ae] focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-[#202329] dark:text-white dark:placeholder:text-white/35 dark:focus:ring-red-950/30",
          error && "border-brand-red"
        )}
        placeholder={placeholder}
        rows={rows}
        {...registration}
      />
      {error ? <span className="auth-error">{error.message}</span> : null}
    </label>
  );
}
