export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
  "https://sherix-app-backend-production-84b9.up.railway.app/api/v1/";

export const DEVICE_ID = "12345";

export function normalizeApiBaseUrl(baseUrl = API_BASE_URL): string {
  return baseUrl.replace(/\/+$/, "");
}

export function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL before submitting requests.",
    );
  }

  return `${normalizeApiBaseUrl()}${normalizeApiPath(path)}`;
}
