"use client";

import { X } from "lucide-react";
import { EmployeeForm } from "@/features/dashboard/components/EmployeeForm";
import type {
  Employee,
  EmployeeFormValues,
} from "@/features/dashboard/types/employee";

interface EmployeeModalProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: EmployeeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AddEmployeeModal({
  employee = null,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: EmployeeModalProps) {
  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(employee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing
                ? "Update team member details and service assignments."
                : "Register a new team member and assign their services."}
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

        <EmployeeForm
          employee={employee}
          isSubmitting={isLoading}
          onCancel={onClose}
          onSubmit={async (values) => {
            await onSubmit(values);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
