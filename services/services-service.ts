import { DEVICE_ID, getApiUrl } from "@/services/api-config";
import { apiClient } from "@/services/http-client";
import {
  normalizePublicServices,
  type PublicService,
} from "../features/auth/service-utils";
import type { ServiceOption } from "../types/service";

type BackendService = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  serviceName?: string;
  description?: string | null;
};

type BackendServicesResponse =
  | BackendService[]
  | {
      data?: BackendService[] | { services?: BackendService[] };
      services?: BackendService[];
      results?: BackendService[];
    };

export async function getPublicServices(): Promise<PublicService[]> {
  const response = await fetch(getApiUrl("/services?is_public=true"), {
    method: "GET",
    headers: {
      "x-device-id": DEVICE_ID,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load services.");
  }

  const services = normalizePublicServices(await response.json());

  if (!services.length) {
    throw new Error("No public services were returned.");
  }

  return services;
}

function normalizeServiceOption(service: BackendService): ServiceOption | null {
  const id = service._id ?? service.id;
  const name = service.name ?? service.title ?? service.serviceName;

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    description: service.description ?? null,
  };
}

function normalizeServicesResponse(response: BackendServicesResponse): ServiceOption[] {
  const rawServices = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : response.data?.services ?? response.services ?? response.results ?? [];

  return rawServices
    .map(normalizeServiceOption)
    .filter((service): service is ServiceOption => Boolean(service));
}

export async function getServices(): Promise<ServiceOption[]> {
  const response = await apiClient.get<BackendServicesResponse>("/services");
  return normalizeServicesResponse(response.data);
}
