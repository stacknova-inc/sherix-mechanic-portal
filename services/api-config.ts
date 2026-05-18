export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
  "https://sherix-app-backend-production.up.railway.app/api/v1/";

export const DEVICE_ID = "123";

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL before submitting requests.",
    );
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}
