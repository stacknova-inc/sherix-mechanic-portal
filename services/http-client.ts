import axios, { AxiosHeaders } from "axios";
import { API_BASE_URL, DEVICE_ID } from "@/services/api-config";

const AUTH_TOKEN_STORAGE_KEY = "sherix-auth-token";
const AUTH_STORE_STORAGE_KEY = "sherix-auth-store";

function readAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const directToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (directToken) {
    return directToken;
  }

  const persistedStore = window.localStorage.getItem(AUTH_STORE_STORAGE_KEY);
  if (!persistedStore) {
    return null;
  }

  try {
    const parsedStore = JSON.parse(persistedStore) as {
      state?: { token?: string | null };
    };
    return parsedStore.state?.token ?? null;
  } catch {
    return null;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ""),
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = readAuthTokenFromStorage();
  config.headers = config.headers ?? new AxiosHeaders();

  config.headers.set("x-device-id", DEVICE_ID);

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
