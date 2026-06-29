import axios, { AxiosHeaders } from "axios";
import {
  API_BASE_URL,
  DEVICE_ID,
  normalizeApiBaseUrl,
  normalizeApiPath,
} from "@/services/api-config";
import { getApiErrorDetails } from "@/services/api-error";

const AUTH_TOKEN_STORAGE_KEY = "sherix-auth-token";
const AUTH_STORE_STORAGE_KEY = "sherix-auth-store";
const SENSITIVE_KEYS = ["authorization", "token", "access_token", "accessToken", "refresh_token", "password", "confirm_password"];

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function readAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const directToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (directToken) {
    return directToken;
  }

  const cookieToken = readCookie(AUTH_TOKEN_STORAGE_KEY);
  if (cookieToken) {
    return cookieToken;
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

function clearClientAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_STORE_STORAGE_KEY);
  document.cookie = `${AUTH_TOKEN_STORAGE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(API_BASE_URL),
  timeout: 30_000,
});

function redactValue(key: string, value: unknown): unknown {
  return SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))
    ? "[redacted]"
    : value;
}

function redactObject(value: unknown): unknown {
  if (value instanceof FormData) {
    return Array.from(value.entries()).reduce<Record<string, unknown>>((payload, [key, entryValue]) => {
      const nextValue = entryValue instanceof File ? `[file:${entryValue.name || "unnamed"}]` : redactValue(key, entryValue);

      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const existingValue = payload[key];
        payload[key] = Array.isArray(existingValue)
          ? [...existingValue, nextValue]
          : [existingValue, nextValue];
        return payload;
      }

      payload[key] = nextValue;
      return payload;
    }, {});
  }

  if (Array.isArray(value)) {
    return value.map(redactObject);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((payload, [key, entryValue]) => {
      payload[key] = typeof entryValue === "object" && entryValue !== null ? redactObject(entryValue) : redactValue(key, entryValue);
      return payload;
    }, {});
  }

  if (typeof value === "string") {
    try {
      return redactObject(JSON.parse(value));
    } catch {
      return value;
    }
  }

  return value;
}

function redactHeaders(headers: unknown): Record<string, unknown> {
  const headerEntries =
    headers instanceof AxiosHeaders
      ? Object.entries(headers.toJSON())
      : headers && typeof headers === "object"
        ? Object.entries(headers as Record<string, unknown>)
        : [];

  return headerEntries.reduce<Record<string, unknown>>((payload, [key, value]) => {
    payload[key] = redactValue(key, value);
    return payload;
  }, {});
}

function getRequestUrl(baseURL: string | undefined, url: string | undefined) {
  if (!url) {
    return baseURL ?? "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${baseURL?.replace(/\/+$/, "") ?? ""}${normalizeApiPath(url)}`;
}

apiClient.interceptors.request.use((config) => {
  const token = readAuthTokenFromStorage();
  config.headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : AxiosHeaders.from(config.headers);

  if (config.url && !/^https?:\/\//i.test(config.url)) {
    config.url = normalizeApiPath(config.url);
  }

  config.headers.set("Accept", "application/json");
  config.headers.set("x-device-id", DEVICE_ID);

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
    config.headers.delete("content-type");
  } else if (config.data !== undefined) {
    config.headers.set("Content-Type", "application/json");
  }

  console.info("[API] Request started", {
    url: getRequestUrl(config.baseURL, config.url),
    method: config.method?.toUpperCase(),
    payload: redactObject(config.data),
    headers: redactHeaders(config.headers),
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.info("[API] Response received", {
      url: getRequestUrl(response.config.baseURL, response.config.url),
      method: response.config.method?.toUpperCase(),
      status: response.status,
      body: redactObject(response.data),
    });

    return response;
  },
  (error) => {
    const details = getApiErrorDetails(error);

    if (details.status === 401 || details.reason.includes("token")) {
      console.warn("[API] Unauthorized request detected", details);

      if (typeof window !== "undefined") {
        clearClientAuthSession();

        if (!window.location.pathname.startsWith("/sign-in")) {
          window.location.replace("/sign-in");
        }
      }
    }

    console.error("[API] Request failed", {
      ...details,
      responseBody: axios.isAxiosError(error) ? redactObject(error.response?.data) : undefined,
      requestPayload: axios.isAxiosError(error) ? redactObject(error.config?.data) : undefined,
      requestHeaders: axios.isAxiosError(error) ? redactHeaders(error.config?.headers) : undefined,
    });

    return Promise.reject(error);
  },
);
