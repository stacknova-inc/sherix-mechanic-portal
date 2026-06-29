"use client";

import type { Employee } from "@/features/dashboard/types/employee";

interface ConfirmEmployeeStatusModalProps {
  employee: Employee | null;
  action: "suspend" | "delete" | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmEmployeeStatusModal({
  employee,
  action,
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmEmployeeStatusModalProps) {
  if (!employee || !action) {
    return null;
  }

  const isDelete = action === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-card dark:bg-[#1b1d22]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {isDelete ? "Delete employee?" : "Suspend employee?"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
          {isDelete
            ? `${employee.fullName} will be removed from the employee roster.`
            : `${employee.fullName} will no longer be available for assignments.`}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isDelete
                ? "rounded-md bg-red-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                : "rounded-md bg-amber-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
            }
          >
            {isLoading
              ? "Saving..."
              : isDelete
                ? "Delete"
                : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}
