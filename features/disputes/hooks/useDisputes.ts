"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDispute,
  getDisputes,
  getEvidenceDownloadUrl,
  submitDisputeResponse,
} from "@/features/disputes/services/disputes-service";
import type { DisputeDetail, DisputeListParams, DisputeResponseInput } from "@/features/disputes/types";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api-error";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const disputesQueryKeys = {
  all: ["disputes"] as const,
  list: (params: DisputeListParams) => ["disputes", "list", params] as const,
  detail: (id: string) => ["disputes", "detail", id] as const,
};

function useCanFetch() {
  const { hasHydrated, token, user } = useAuthStore();
  return hasHydrated && Boolean(token && isCompanyAdmin(user));
}

export function useDisputes(params: DisputeListParams) {
  return useQuery({
    queryKey: disputesQueryKeys.list(params),
    queryFn: () => getDisputes(params),
    enabled: useCanFetch(),
    placeholderData: keepPreviousData,
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: disputesQueryKeys.detail(id),
    queryFn: () => getDispute(id),
    enabled: useCanFetch() && Boolean(id),
  });
}

export function useSubmitDisputeResponse(disputeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (input: DisputeResponseInput) => {
      setProgress(0);
      return submitDisputeResponse(disputeId, input, setProgress);
    },
    onSuccess: (dispute: DisputeDetail) => {
      queryClient.setQueryData(disputesQueryKeys.detail(disputeId), dispute);
      void queryClient.invalidateQueries({ queryKey: disputesQueryKeys.all });
      toast({ type: "success", message: "Your response was submitted." });
    },
  });

  return { ...mutation, progress };
}

export function useEvidenceDownload(disputeId: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (evidenceId: string) => getEvidenceDownloadUrl(disputeId, evidenceId),
    onSuccess: ({ url }) => {
      // Short-lived, authorized URL from the backend; opened without giving the new tab access to this page.
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (error: unknown) => {
      toast({ type: "error", message: getApiErrorMessage(error) });
    },
  });
}
