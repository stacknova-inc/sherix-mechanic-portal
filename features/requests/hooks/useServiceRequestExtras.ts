"use client";

import { useQuery } from "@tanstack/react-query";
import { getServiceRequestExtras } from "@/features/requests/services/service-request-extras-service";
import type { CompanyServiceRequest } from "@/features/requests/types";

export function useServiceRequestExtras(request: CompanyServiceRequest) {
  return useQuery({
    queryKey: ["service-request-extras", request.id, request.status, request.date],
    queryFn: () =>
      getServiceRequestExtras(request.id, {
        status: request.status,
        date: request.date,
        mechanicId: request.mechanicId,
      }),
  });
}
