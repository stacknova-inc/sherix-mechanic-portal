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
  service?: BackendService;
};

type BackendServicesResponse =
  | BackendService[]
  | {
      data?: BackendService[] | { services?: BackendService[]; companyServices?: BackendService[] };
      services?: BackendService[];
      companyServices?: BackendService[];
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
  const subscribedService = service.service ?? service;
  const id = subscribedService._id ?? subscribedService.id;
  const name = subscribedService.name ?? subscribedService.title ?? subscribedService.serviceName;

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    description: subscribedService.description ?? service.description ?? null,
  };
}

function normalizeServicesResponse(response: BackendServicesResponse): ServiceOption[] {
  const rawServices = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : response.data?.companyServices ??
        response.data?.services ??
        response.companyServices ??
        response.services ??
        response.results ??
        [];

  return rawServices
    .map(normalizeServiceOption)
    .filter((service): service is ServiceOption => Boolean(service));
}

export async function getServices(): Promise<ServiceOption[]> {
  console.info("[Services] Company subscribed services request started");
  const response = await apiClient.get<BackendServicesResponse>("/services/company-services");
  const services = normalizeServicesResponse(response.data);
  console.info("[Services] Company subscribed services loaded successfully", {
    count: services.length,
    emptyDataset: services.length === 0,
  });
  return services;
}
