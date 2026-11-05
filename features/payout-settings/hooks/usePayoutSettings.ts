"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPayoutSettings,
  previewPayoutSettings,
  updatePayoutSettings,
} from "@/features/payout-settings/services/payout-settings-service";
import type { PayoutPolicy, UpdatePayoutSettingsInput } from "@/features/payout-settings/types";
import { useToast } from "@/hooks/use-toast";
import { hasPermission, useUserRole } from "@/hooks/use-user-role";
import { getApiErrorDetails } from "@/services/api-error";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const payoutSettingsQueryKey = ["payout-settings"] as const;

export function usePayoutSettings() {
  const { hasHydrated, token, user } = useAuthStore();
  const role = useUserRole();

  return useQuery({
    queryKey: payoutSettingsQueryKey,
    queryFn: getPayoutSettings,
    // Never request settings the current role may not change.
    enabled: hasHydrated && Boolean(token && isCompanyAdmin(user)) && hasPermission(role, "configurePayouts"),
  });
}

export function usePreviewPayoutSettings() {
  return useMutation({
    mutationFn: (policy: PayoutPolicy) => previewPayoutSettings(policy),
  });
}

export function useUpdatePayoutSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: UpdatePayoutSettingsInput) => updatePayoutSettings(input),
    onSuccess: () => {
      toast({ type: "success", message: "Payout settings saved." });
    },
    onError: (error: unknown) => {
      const details = getApiErrorDetails(error, "Unable to save payout settings.");
      toast({
        type: "error",
        message:
          details.status === 409
            ? "Payout settings were changed by someone else. The latest version has been loaded; review and try again."
            : details.message,
      });
    },
    // Success loads the new version; a 409 loads the version that won.
    onSettled: () => queryClient.invalidateQueries({ queryKey: payoutSettingsQueryKey }),
  });
}
