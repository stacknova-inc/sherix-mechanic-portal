import axios from "axios";

type BackendErrorPayload = {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<BackendErrorPayload>(error)) {
    const payload = error.response?.data;
    const fieldErrors = payload?.errors
      ? Object.values(payload.errors).flat().filter(Boolean)
      : [];

    return (
      payload?.message ??
      payload?.detail ??
      payload?.error ??
      fieldErrors[0] ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
