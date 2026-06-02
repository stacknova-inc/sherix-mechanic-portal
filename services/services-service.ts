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
  console.info("[Services] Services request started");
  const response = await apiClient.get<unknown>("/services/active-services");
  const services = normalizePublicServices(response.data);
  console.info("[Services] Services loaded successfully", {
    count: services.length,
    emptyDataset: services.length === 0,
  });
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
  console.info("[Services] Dashboard services request started");
  const response = await apiClient.get<BackendServicesResponse>("/services/active-services");
  const services = normalizeServicesResponse(response.data);
  console.info("[Services] Dashboard services loaded successfully", {
    count: services.length,
    emptyDataset: services.length === 0,
  });
  return services;
}
