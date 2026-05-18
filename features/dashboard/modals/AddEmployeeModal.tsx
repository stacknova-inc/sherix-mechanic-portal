"use client";

import { useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import { ServiceSpecialtyDropdown } from "@/features/dashboard/components/ServiceSpecialtyDropdown";
import {
  DEFAULT_EMPLOYEE_AVATAR,
  EXPERIENCE_LEVELS,
} from "@/features/dashboard/constants/employee-options";
import type {
  CreateEmployeeInput,
  ExperienceLevel,
  ServiceSpecialty,
} from "@/features/dashboard/types/employee";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: CreateEmployeeInput) => Promise<void>;
  isLoading?: boolean;
}

function createEmptyEmployeeForm(): CreateEmployeeInput {
  return {
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceSpecialties: [] as ServiceSpecialty[],
    dateOfBirth: "",
    experienceLevel: "1-3 years" as ExperienceLevel,
    profilePhotoUrl: DEFAULT_EMPLOYEE_AVATAR,
    status: "AVAILABLE",
    jobsCompleted: 0,
    onboardedDate: new Date().toISOString().split("T")[0],
  };
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddEmployeeModalProps) {
  const emptyEmployeeForm = useMemo(() => createEmptyEmployeeForm(), []);
  const [formData, setFormData] = useState<CreateEmployeeInput>(emptyEmployeeForm);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (formData.serviceSpecialties.length === 0) {
      setError("Please select at least one service specialty");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        email: formData.email?.trim() || null,
      });
      setFormData(createEmptyEmployeeForm());
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to add employee",
      );
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
            <p className="text-sm text-gray-600">
              Register a new team member and assign their specialization
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold uppercase text-gray-900">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <img
                src={formData.profilePhotoUrl ?? DEFAULT_EMPLOYEE_AVATAR}
                alt="Profile preview"
                className="size-16 rounded-full border-2 border-gray-200 object-cover"
              />
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 hover:border-gray-400 hover:bg-gray-50">
                <Upload size={18} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-gray-500">
                    Square JPG or PNG, max 2MB. A clear professional face shot is recommended.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Robert Smith"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="(555) 000-0000"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email ?? ""}
                onChange={handleChange}
                placeholder="r.smith@autofix.com"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Specialties <span className="text-red-600">*</span>
              </label>
              <ServiceSpecialtyDropdown
                selected={formData.serviceSpecialties}
                onChange={(serviceSpecialties) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    serviceSpecialties,
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
