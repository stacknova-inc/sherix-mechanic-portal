export type PublicService = {
  id: string;
  name: string;
  description?: string;
  is_public?: boolean;
};

export function normalizeServiceIds(serviceIds: string[] | string | undefined) {
  if (Array.isArray(serviceIds)) {
    return serviceIds;
  }

  return serviceIds
    ? serviceIds
        .split(",")
        .map((serviceId) => serviceId.trim())
        .filter(Boolean)
    : [];
}

export function getServiceNames(
  serviceIds: string[] | string | undefined,
  services: PublicService[] = [],
) {
  return normalizeServiceIds(serviceIds)
    .map((id) => services.find((service) => service.id === id)?.name ?? id)
    .join(", ");
}

export function normalizePublicServices(payload: unknown): PublicService[] {
  const rawServices = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload !== null
      ? Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : Array.isArray((payload as { services?: unknown }).services)
          ? (payload as { services: unknown[] }).services
          : []
      : [];

  return rawServices.reduce<PublicService[]>((services, service) => {
      if (typeof service !== "object" || service === null) {
        return services;
      }

      const record = service as Record<string, unknown>;
      const id = record.id ?? record._id;
      const name = record.name ?? record.title ?? record.service_name;

      if (typeof id !== "string" || typeof name !== "string") {
        return services;
      }

      services.push({
        id,
        name,
        description:
          typeof record.description === "string" ? record.description : undefined,
        is_public:
          typeof record.is_public === "boolean" ? record.is_public : undefined,
      });

      return services;
    }, []);
}
