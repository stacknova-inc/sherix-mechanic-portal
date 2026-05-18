import { DEVICE_ID, getApiUrl } from "@/services/api-config";
import {
  normalizePublicServices,
  type PublicService,
} from "../features/auth/service-utils";

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
