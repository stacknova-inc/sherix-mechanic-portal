import type { AuthResponse, LoginCredentials, SignupFiles, SignupFormData } from "@/types/auth";

const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed. Please try again.");
  }

  return data as T;
}

export function buildSignupPayload(data: SignupFormData, files: SignupFiles) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });

  return formData;
}

function mockAuthResponse(data: Pick<SignupFormData, "fullName" | "personalEmail">): AuthResponse {
  return {
    token: "frontend-preview-token",
    user: {
      name: data.fullName,
      email: data.personalEmail,
      role: "Provider Admin"
    },
    message: "Frontend setup flow completed."
  };
}

export async function submitSignup(data: SignupFormData, files: SignupFiles) {
  const formData = buildSignupPayload(data, files);

  if (!AUTH_API_BASE_URL) {
    return mockAuthResponse(data);
  }

  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/setup`, {
    method: "POST",
    body: formData
  });

  return parseResponse<AuthResponse>(response);
}

export async function signIn(credentials: LoginCredentials) {
  if (!AUTH_API_BASE_URL) {
    return {
      token: "frontend-preview-token",
      user: {
        name: "Sherix Admin",
        email: credentials.email,
        role: "Provider Admin"
      },
      message: "Frontend sign-in completed."
    };
  }

  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  return parseResponse<AuthResponse>(response);
}
