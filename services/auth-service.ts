import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignupFiles,
  SignupFormData,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;

const AUTH_TOKEN_STORAGE_KEY = "sherix-auth-token";

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

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL before submitting auth requests.",
    );
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

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

function appendIfFile(formData: FormData, key: string, file: File | null | undefined) {
  if (file instanceof File && file.size > 0) {
    formData.append(key, file);
  }
}

function parseServices(servicesOffered: string): string[] {
  return servicesOffered
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean);
}

export function buildSignupPayload(data: SignupFormData, files: SignupFiles) {
  const formData = new FormData();

  formData.append("company_name", data.companyName);
  formData.append("business_email", data.businessEmail);
  formData.append("company_number", data.companyNumber);
  formData.append("coverage_area", data.coverage_area);
  formData.append("bank_details", data.bankDetails);

  parseServices(data.servicesOffered).forEach((service) => {
    formData.append("services[]", service);
  });

  formData.append("full_name", data.fullName);
  formData.append("personal_email", data.personalEmail);
  formData.append("password", data.password);
  formData.append("confirm_password", data.confirmPassword);
  formData.append("working_hours", data.workingHours);
  formData.append("terms_accepted", data.signedAgreementAccepted ? "true" : "false");

  appendIfFile(formData, "registration_certificate", files.registrationCertificate);
  appendIfFile(formData, "proof_of_address", files.garageProof);
  appendIfFile(formData, "business_insurance", files.businessInsurance);
  appendIfFile(formData, "ghana_card", files.ghanaCard);
  appendIfFile(formData, "admin_insurance", files.insuranceUpload);

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
