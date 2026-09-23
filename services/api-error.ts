import axios from "axios";

type BackendErrorPayload = {
  message?: unknown;
  detail?: unknown;
  error?: unknown;
  errors?: Array<Record<string, unknown> | string> | Record<string, string[] | string>;
};

export type ApiFailureReason =
  | "invalid_credentials"
  | "email_not_verified"
  | "missing_authentication_token"
  | "invalid_authentication_token"
  | "expired_authentication_token"
  | "network_failure"
  | "backend_validation_failure"
  | "backend_server_error"
  | "frontend_payload_formatting_issue"
  | "authentication_issue"
  | "invalid_api_endpoint"
  | "backend_response_issue"
  | "empty_dataset"
  | "unknown";

export type ApiErrorDetails = {
  message: string;
  reason: ApiFailureReason;
  status?: number;
  backendMessage?: string;
  url?: string;
  method?: string;
};

function formatErrorValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const messages = value.map(formatErrorValue).filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(" ") : undefined;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const message = formatErrorValue(record.message ?? record.msg ?? record.error ?? record.detail);
    if (message) return message;

    const values = Object.values(record)
      .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
      .map(formatErrorValue)
      .filter((entry): entry is string => Boolean(entry));
    return values.length ? values.join(" ") : undefined;
  }

  return undefined;
}

function getBackendMessage(payload: BackendErrorPayload | undefined): string | undefined {
  const fieldErrors = Array.isArray(payload?.errors)
    ? payload.errors
        .map((error) => {
          if (typeof error === "string") {
            return error;
          }

          return (
            error.message ??
            error.msg ??
            error.error ??
            error.detail ??
            undefined
          );
        })
        .filter(Boolean)
    : payload?.errors
      ? Object.values(payload.errors).flat().filter(Boolean)
      : [];

  return formatErrorValue(payload?.message)
    ?? formatErrorValue(payload?.detail)
    ?? formatErrorValue(payload?.error)
    ?? formatErrorValue(fieldErrors[0]);
}

function classifyByMessage(message: string): ApiFailureReason {
  const normalized = message.toLowerCase();

  if (normalized.includes("verify") || normalized.includes("verified")) {
    return "email_not_verified";
  }

  if (
    normalized.includes("invalid credential") ||
    normalized.includes("incorrect password") ||
    normalized.includes("wrong password")
  ) {
    return "invalid_credentials";
  }

  if (normalized.includes("expired")) {
    return "expired_authentication_token";
  }

  if (normalized.includes("token") && normalized.includes("missing")) {
    return "missing_authentication_token";
  }

  if (normalized.includes("invalid") && normalized.includes("token")) {
    return "invalid_authentication_token";
  }

  return "unknown";
}

export function getApiErrorDetails(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ApiErrorDetails {
  if (axios.isAxiosError<BackendErrorPayload>(error)) {
    const status = error.response?.status;
    const backendMessage = getBackendMessage(error.response?.data);
    const message = backendMessage ?? error.message ?? fallback;
    const messageReason = classifyByMessage(message);
    const reason =
      messageReason !== "unknown"
        ? messageReason
        : !error.response
          ? "network_failure"
          : status === 400
            ? "frontend_payload_formatting_issue"
            : status === 401
              ? "invalid_authentication_token"
              : status === 403
                ? "authentication_issue"
                : status === 404
                  ? "invalid_api_endpoint"
                  : status === 422
                    ? "backend_validation_failure"
                    : status && status >= 500
                      ? "backend_server_error"
                      : "backend_response_issue";

    return {
      message,
      reason,
      status,
      backendMessage,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      reason: classifyByMessage(error.message),
    };
  }

  return {
    message: fallback,
    reason: "unknown",
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return getApiErrorDetails(error, fallback).message;
}
