import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignupFiles,
  SignupFormData,
} from "@/types/auth";
import { normalizeServiceIds } from "../features/auth/service-utils";
import { getApiErrorDetails } from "@/services/api-error";
import { apiClient } from "@/services/http-client";

const AUTH_TOKEN_STORAGE_KEY = "sherix-auth-token";
export const AUTH_TOKEN_COOKIE_KEY = "sherix-auth-token";
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
    userData?: Partial<AuthUser>;
  };
  message?: string;
  detail?: string;
  error?: string;
};

type BackendMessageResponse = {
  message?: string;
  detail?: string;
  error?: string;
  data?: unknown;
};

type BackendUser = Partial<AuthUser> & {
  fullName?: string;
  personalEmail?: string;
};

function getFileDebug(file: File | null | undefined) {
  return file instanceof File
    ? {
        isFile: true,
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
      }
    : {
        isFile: false,
        valueType: file === null ? "null" : typeof file,
      };
}

function getSignupDebugSummary(data: SignupFormData, files: SignupFiles) {
  return {
    companyName: data.companyName.trim(),
    businessEmail: data.businessEmail.trim(),
    companyNumber: data.companyNumber.trim(),
    coverageArea: data.coverage_area.trim(),
    fullName: data.fullName.trim(),
    personalEmail: data.personalEmail.trim(),
    serviceIds: normalizeServiceIds(data.servicesOffered),
    workingHours: data.workingHours.trim(),
    termsAccepted: data.signedAgreementAccepted,
    password: data.password ? "[present]" : "[missing]",
    confirmPassword: data.confirmPassword ? "[present]" : "[missing]",
    files: {
      registration_certificate: getFileDebug(files.registrationCertificate),
      proof_of_address: getFileDebug(files.garageProof),
      business_insurance: getFileDebug(files.businessInsurance),
      ghana_card: getFileDebug(files.ghanaCard),
      admin_insurance: getFileDebug(files.insuranceUpload),
    },
  };
}

function getFormDataDebugSummary(formData: FormData) {
  return Array.from(formData.entries()).reduce<Record<string, unknown>>(
    (payload, [key, value]) => {
      const nextValue =
        value instanceof File
          ? {
              fileName: value.name,
              fileSize: value.size,
              fileType: value.type || "unknown",
            }
          : key.toLowerCase().includes("password")
            ? "[redacted]"
            : value;

      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const existingValue = payload[key];
        payload[key] = Array.isArray(existingValue)
          ? [...existingValue, nextValue]
          : [existingValue, nextValue];
        return payload;
      }

      payload[key] = nextValue;
      return payload;
    },
    {},
  );
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
      throw new Error("Services must be selected from the active services list.");
    }
  });

  return Array.from(new Set(serviceIds));
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

  formData.append("company_name", data.companyName.trim());
  formData.append("business_email", data.businessEmail.trim());
  formData.append("company_number", data.companyNumber.trim());
  formData.append("coverage_area", data.coverage_area.trim());

  serviceIds.forEach((serviceId) => {
    formData.append("services", serviceId);
  });

  formData.append("full_name", data.fullName.trim());
  formData.append("personal_email", data.personalEmail.trim());
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
  const backendUser = (response.user ?? response.data?.user ?? response.data?.userData) as
    | BackendUser
    | undefined;

  return {
    id: backendUser?.id,
    name: backendUser?.name ?? backendUser?.fullName ?? fallback.name,
    email: backendUser?.email ?? backendUser?.personalEmail ?? fallback.email,
    role: backendUser?.role,
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
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=${encodeURIComponent(
      token,
    )}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }
}

export function clearPersistedAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
  }
}

export async function submitSignup(
  data: SignupFormData,
  files: SignupFiles,
): Promise<AuthResponse> {
  console.info("[Auth][Signup][1] Preparing signup request", getSignupDebugSummary(data, files));

  try {
    const payload = buildSignupPayload(data, files);
    console.info("[Auth][Signup][2] FormData constructed", getFormDataDebugSummary(payload));

    const response = await apiClient.post<BackendAuthResponse>(
      "/company-onboarding/register",
      payload,
    );
    console.info("[Auth][Signup][3] Backend signup response received", {
      status: response.status,
      hasToken:
        Boolean(response.data.token) ||
        Boolean(response.data.access_token) ||
        Boolean(response.data.accessToken) ||
        Boolean(response.data.data?.token) ||
        Boolean(response.data.data?.access_token) ||
        Boolean(response.data.data?.accessToken),
      message: response.data.message,
    });

    const parsedResponse = response.data;
    const authResponse = normalizeAuthResponse(parsedResponse, {
      name: data.fullName,
      email: data.personalEmail,
    });

    persistAuthToken(authResponse.token);
    console.info("[Auth][Signup][4] Signup auth token persisted", {
      userEmail: authResponse.user.email,
      userRole: authResponse.user.role,
    });

    return authResponse;
  } catch (error) {
    console.error("[Auth][Signup][Error] Signup failed", getApiErrorDetails(error, "Unable to create account."));
    throw error;
  }
}

export async function verifySignupEmail(token: string): Promise<BackendMessageResponse> {
  console.info("[Auth][VerifyEmail] Verifying signup email token", {
    hasToken: Boolean(token),
  });

  const response = await apiClient.post<BackendMessageResponse>(
    "/company-onboarding/verify-email",
    { token },
  );

  console.info("[Auth][VerifyEmail] Verification response received", {
    status: response.status,
    message: response.data.message ?? response.data.detail,
  });

  return response.data;
}

export async function resendSignupVerification(
  businessEmail: string,
): Promise<BackendMessageResponse> {
  console.info("[Auth][VerifyEmail] Resending signup verification email", {
    businessEmail: businessEmail.trim(),
  });

  const response = await apiClient.post<BackendMessageResponse>(
    "/company-onboarding/resend-verification",
    { business_email: businessEmail.trim() },
  );

  console.info("[Auth][VerifyEmail] Resend response received", {
    status: response.status,
    message: response.data.message ?? response.data.detail,
  });

  return response.data;
}

export async function signIn(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  console.info("[Auth][Login][1] Sending backend login request", {
    endpoint: "/auth/login",
    email: credentials.email.trim(),
    hasPassword: Boolean(credentials.password),
    selectedServiceId: credentials.serviceId || null,
  });

  try {
    const response = await apiClient.post<BackendAuthResponse>("/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    console.info("[Auth][Login][2] Backend login response received", {
      status: response.status,
      hasToken:
        Boolean(response.data.token) ||
        Boolean(response.data.access_token) ||
        Boolean(response.data.accessToken) ||
        Boolean(response.data.data?.token) ||
        Boolean(response.data.data?.access_token) ||
        Boolean(response.data.data?.accessToken),
      message: response.data.message,
    });

    const parsedResponse = response.data;
    const authResponse = normalizeAuthResponse(parsedResponse, {
      name: "Sherix Admin",
      email: credentials.email.trim(),
    });

    persistAuthToken(authResponse.token);
    console.info("[Auth][Login][3] Login auth token persisted", {
      userEmail: authResponse.user.email,
      userRole: authResponse.user.role,
    });

    return authResponse;
  } catch (error) {
    console.error("[Auth][Login][Error] Login failed", getApiErrorDetails(error, "Unable to sign in."));
    throw error;
  }
}
