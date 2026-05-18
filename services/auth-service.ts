import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignupFiles,
  SignupFormData,
} from "@/types/auth";
import { normalizeServiceIds } from "../features/auth/service-utils";
import { DEVICE_ID, getApiUrl } from "@/services/api-config";

const AUTH_TOKEN_STORAGE_KEY = "sherix-auth-token";
const SERVICE_ID_PATTERN = /^[a-f0-9]{24}$/i;
const WORKING_HOURS_PATTERN = /^(?:[1-9]|1\d|2[0-4])$/;

type BackendAuthResponse = {
  token?: string;
  access_token?: string;
  accessToken?: string;
  user?: Partial<AuthUser>;
  data?: {
    token?: string;
    access_token?: string;
    accessToken?: string;
    user?: Partial<AuthUser>;
  };
  message?: string;
  detail?: string;
  error?: string;
};

type BackendUser = Partial<AuthUser> & {
  fullName?: string;
  personalEmail?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    const message =
      data?.message ??
      data?.detail ??
      data?.error ??
      "Request failed. Please try again.";

    throw new Error(message);
  }

  return data as T;
}

function appendRequiredFile(
  formData: FormData,
  key: string,
  file: File | null | undefined,
) {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error(`${key} must be uploaded as a file.`);
  }

  formData.append(key, file);
}

function getValidServiceIds(servicesOffered: SignupFormData["servicesOffered"]) {
  const serviceIds = normalizeServiceIds(servicesOffered);

  if (!serviceIds.length) {
    throw new Error("Select at least one service.");
  }

  serviceIds.forEach((serviceId) => {
    if (!SERVICE_ID_PATTERN.test(serviceId)) {
      throw new Error("Each service must be selected separately.");
    }
  });

  return serviceIds;
}

function getValidWorkingHours(workingHours: string) {
  const normalizedWorkingHours = workingHours.trim();

  if (!WORKING_HOURS_PATTERN.test(normalizedWorkingHours)) {
    throw new Error("Working hours must be a number from 1 to 24.");
  }

  return normalizedWorkingHours;
}

export function buildSignupPayload(data: SignupFormData, files: SignupFiles) {
  const formData = new FormData();
  const serviceIds = getValidServiceIds(data.servicesOffered);
  const workingHours = getValidWorkingHours(data.workingHours);

  if (!data.signedAgreementAccepted) {
    throw new Error("You must accept the terms before creating an account.");
  }

  formData.append("company_name", data.companyName);
  formData.append("business_email", data.businessEmail);
  formData.append("company_number", data.companyNumber);
  formData.append("coverage_area", data.coverage_area);

  serviceIds.forEach((serviceId) => {
    formData.append("services", serviceId);
  });

  formData.append("full_name", data.fullName);
  formData.append("personal_email", data.personalEmail);
  formData.append("password", data.password);
  formData.append("confirm_password", data.confirmPassword);
  formData.append("working_hours", workingHours);
  formData.append("terms_accepted", "true");

  appendRequiredFile(formData, "registration_certificate", files.registrationCertificate);
  appendRequiredFile(formData, "proof_of_address", files.garageProof);
  appendRequiredFile(formData, "business_insurance", files.businessInsurance);
  appendRequiredFile(formData, "ghana_card", files.ghanaCard);
  appendRequiredFile(formData, "admin_insurance", files.insuranceUpload);

  return formData;
}

function getToken(response: BackendAuthResponse): string {
  const token =
    response.token ??
    response.access_token ??
    response.accessToken ??
    response.data?.token ??
    response.data?.access_token ??
    response.data?.accessToken;

  if (!token) {
    throw new Error("Authentication succeeded but no token was returned.");
  }

  return token;
}

function normalizeUser(
  response: BackendAuthResponse,
  fallback: Pick<AuthUser, "name" | "email">,
): AuthUser {
  const backendUser = (response.user ?? response.data?.user) as
    | BackendUser
    | undefined;

  return {
    id: backendUser?.id,
    name: backendUser?.name ?? backendUser?.fullName ?? fallback.name,
    email: backendUser?.email ?? backendUser?.personalEmail ?? fallback.email,
    role: backendUser?.role ?? "Provider Admin",
  };
}

function normalizeAuthResponse(
  response: BackendAuthResponse,
  fallbackUser: Pick<AuthUser, "name" | "email">,
): AuthResponse {
  return {
    token: getToken(response),
    user: normalizeUser(response, fallbackUser),
    message: response.message,
  };
}

export function persistAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearPersistedAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export async function submitSignup(
  data: SignupFormData,
  files: SignupFiles,
): Promise<AuthResponse> {
  const response = await fetch(getApiUrl("/company-onboarding/register"), {
    method: "POST",
    headers: {
      "x-device-id": DEVICE_ID,
    },
    body: buildSignupPayload(data, files),
  });

  const parsedResponse = await parseResponse<BackendAuthResponse>(response);
  const authResponse = normalizeAuthResponse(parsedResponse, {
    name: data.fullName,
    email: data.personalEmail,
  });

  persistAuthToken(authResponse.token);

  return authResponse;
}

export async function signIn(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const parsedResponse = await parseResponse<BackendAuthResponse>(response);
  const authResponse = normalizeAuthResponse(parsedResponse, {
    name: "Sherix Admin",
    email: credentials.email,
  });

  persistAuthToken(authResponse.token);

  return authResponse;
}
