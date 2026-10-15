"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/services/api-error";
import { useToast } from "@/hooks/use-toast";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { companyServiceRequestsQueryKey } from "@/features/requests/hooks/useCompanyServiceRequests";
import {
  assignCompanyServiceRequestMechanic,
  getReassignableCompanyMechanics,
} from "@/features/requests/services/service-requests-service";
import type { CompanyServiceRequest } from "@/features/requests/types";

interface ReassignServiceRequestDialogProps {
  request: CompanyServiceRequest;
  onClose: () => void;
}

export function ReassignServiceRequestDialog({ request, onClose }: ReassignServiceRequestDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mechanicId, setMechanicId] = useState("");
  const [reason, setReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mechanicsQuery = useQuery({
    queryKey: [...companyServiceRequestsQueryKey, "reassignable-mechanics", request.id],
    queryFn: () => getReassignableCompanyMechanics(request.id),
    enabled: Boolean(request.id),
  });
  const assignMutation = useMutation({
    mutationFn: () => assignCompanyServiceRequestMechanic(request.id, mechanicId, reason.trim()),
    onSuccess: async () => {
      toast({ type: "success", message: "Service Request reassigned successfully." });
      await queryClient.invalidateQueries({ queryKey: companyServiceRequestsQueryKey });
      onClose();
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Unable to reassign this Service Request.");
      setSubmitError(message);
      toast({ type: "error", message });
    },
  });

  useEffect(() => {
    setMechanicId("");
    setReason("");
    setSubmitError(null);
  }, [request.id]);

  const mechanics = mechanicsQuery.data ?? [];
  const hasValidSelection = Boolean(mechanics.some((mechanic) => mechanic.id === mechanicId));
  const canSubmit = Boolean(request.id && hasValidSelection && !assignMutation.isPending);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reassign-service-request-title"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-card dark:bg-[#1b1d22]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="reassign-service-request-title" className="text-lg font-extrabold text-brand-dark dark:text-white">
              Reassign Service Request
            </h2>
            <p className="mt-1 text-sm text-[#6f7784] dark:text-white/55">{request.reference}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assignMutation.isPending}
            aria-label="Close reassignment dialog"
            className="rounded px-2 py-1 text-xl leading-none text-[#6f7784] hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="mt-5">
          {mechanicsQuery.isLoading ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-[#6f7784] dark:bg-white/5 dark:text-white/60" role="status">
              Loading available mechanics…
            </p>
          ) : mechanicsQuery.isError ? (
            <QueryErrorState
              error={mechanicsQuery.error}
              subject="available mechanics"
              onRetry={() => void mechanicsQuery.refetch()}
            />
          ) : mechanics.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-[#6f7784] dark:bg-white/5 dark:text-white/60">
              No unassigned mechanics are currently available.
            </p>
          ) : (
            <>
              <label htmlFor="reassign-mechanic" className="mb-1.5 block text-sm font-bold text-brand-dark dark:text-white">
                Available mechanic
              </label>
              <select
                id="reassign-mechanic"
                value={mechanicId}
                onChange={(event) => {
                  setMechanicId(event.target.value);
                  setSubmitError(null);
                }}
                className="h-11 w-full rounded-lg border border-[#dfe3e9] bg-white px-3 text-sm text-brand-dark outline-none focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:border-white/10 dark:bg-[#202329] dark:text-white"
              >
                <option value="">Select a mechanic</option>
                {mechanics.map((mechanic) => (
                  <option key={mechanic.id} value={mechanic.id}>{mechanic.name}</option>
                ))}
              </select>

              <label htmlFor="reassign-reason" className="mb-1.5 mt-4 block text-sm font-bold text-brand-dark dark:text-white">
                Reason <span className="font-normal text-[#8f96a3]">(optional)</span>
              </label>
              <textarea
                id="reassign-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={500}
                className="w-full resize-y rounded-lg border border-[#dfe3e9] bg-white px-3 py-2 text-sm text-brand-dark outline-none focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:border-white/10 dark:bg-[#202329] dark:text-white"
              />
            </>
          )}
        </div>

        {submitError ? <p className="mt-3 text-sm font-semibold text-brand-red" role="alert">{submitError}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={assignMutation.isPending}
            className="rounded-lg border border-[#dfe3e9] px-4 py-2 text-sm font-bold text-[#596170] disabled:opacity-50 dark:border-white/10 dark:text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitError(null);
              assignMutation.mutate();
            }}
            disabled={!canSubmit}
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assignMutation.isPending ? "Reassigning…" : "Reassign"}
          </button>
        </div>
      </section>
    </div>
  );
}
