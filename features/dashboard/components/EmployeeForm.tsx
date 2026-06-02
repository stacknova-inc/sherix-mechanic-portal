"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Upload } from "lucide-react";
import { ServicesMultiSelect } from "./ServicesMultiSelect";
import {
  DEFAULT_EMPLOYEE_AVATAR,
  EXPERIENCE_LEVELS,
} from "@/features/dashboard/constants/employee-options";
import type {
  Employee,
  EmployeeFormValues,
} from "@/features/dashboard/types/employee";

interface EmployeeFormProps {
  employee?: Employee | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
}

function getDefaultValues(employee?: Employee | null): EmployeeFormValues {
  return {
    name: employee?.name ?? employee?.fullName ?? "",
    phoneNumber: employee?.phoneNumber ?? "",
    email: employee?.email ?? "",
    dateOfBirth: employee?.dateOfBirth ?? "",
    levelOfExperience: employee?.levelOfExperience ?? employee?.experienceLevel ?? "1-3 years",
    serviceIds: employee?.services?.map((service) => service.id).filter(Boolean) ?? [],
    profilePhoto: null,
  };
}

export function EmployeeForm({
  employee,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: EmployeeFormProps) {
  const defaultValues = useMemo(() => getDefaultValues(employee), [employee]);
  const [previewUrl, setPreviewUrl] = useState(
    employee?.profilePhotoUrl ?? DEFAULT_EMPLOYEE_AVATAR,
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<EmployeeFormValues>({
    defaultValues,
  });

  const profilePhoto = watch("profilePhoto");

  useEffect(() => {
    reset(defaultValues);
    setPreviewUrl(employee?.profilePhotoUrl ?? DEFAULT_EMPLOYEE_AVATAR);
  }, [defaultValues, employee?.profilePhotoUrl, reset]);

  useEffect(() => {
    const file = profilePhoto?.[0];
    if (!(file instanceof File)) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [profilePhoto]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold uppercase text-gray-900 dark:text-white">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="size-16 rounded-full border-2 border-gray-200 object-cover"
          />
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 hover:border-gray-400 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">
            <Upload size={18} className="text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/75">
                Click to upload photo
              </p>
              <p className="text-xs text-gray-500 dark:text-white/45">
                Square JPG or PNG, max 2MB.
              </p>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              disabled={isSubmitting}
              {...register("profilePhoto", {
                validate: (files) => {
                  const file = files?.[0];
                  if (employee && !file) {
                    return true;
                  }

                  if (!file) {
                    return "Profile photo is required.";
                  }

                  return file.size <= 2 * 1024 * 1024 || "Photo must be 2MB or less.";
                },
              })}
            />
          </label>
        </div>
        {errors.profilePhoto ? (
          <p className="mt-2 text-sm text-red-600">{errors.profilePhoto.message}</p>
        ) : null}
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Robert Smith"
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/10"
            {...register("name", { required: "Full name is required." })}
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Experience Level
          </label>
          <select
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/10"
            {...register("levelOfExperience", {
              required: "Experience level is required.",
            })}
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            placeholder="(555) 000-0000"
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/10"
            {...register("phoneNumber", {
              required: "Phone number is required.",
            })}
          />
          {errors.phoneNumber ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.phoneNumber.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            placeholder="r.smith@autofix.com"
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/10"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Services <span className="text-red-600">*</span>
          </label>
          <Controller
            control={control}
            name="serviceIds"
            rules={{
              validate: (serviceIds) =>
                serviceIds.length > 0 || "Select at least one service.",
            }}
            render={({ field }) => (
              <ServicesMultiSelect
                selectedServiceIds={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                hasError={Boolean(errors.serviceIds)}
              />
            )}
          />
          {errors.serviceIds ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.serviceIds.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/70">
            Date of Birth <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/10"
            {...register("dateOfBirth", {
              required: "Date of birth is required.",
            })}
          />
          {errors.dateOfBirth ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.dateOfBirth.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/10"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
