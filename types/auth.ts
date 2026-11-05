export type SignupStep = 1 | 2 | 3;

export type UploadedFileKey =
  | "registrationCertificate"
  | "garageProof"
  | "businessInsurance";

export type SignupFormData = {
  companyName: string;
  registrationNumber: string;
  coverage_area: string;
  personnelCount: string;
  fullName: string;
  personalEmail: string;
  password: string;
  confirmPassword: string;
  servicesOffered: string[];
  signedAgreementAccepted: boolean;
};

export type SignupFiles = Partial<Record<UploadedFileKey, File | null>>;

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  /** Returned by the API after company compliance review, when available. */
  companyVerificationStatus?: "pending" | "approved" | "rejected" | "unknown";
  companyVerificationReason?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
  serviceId?: string;
};

export type AuthResponse = {
  token?: string;
  user: AuthUser;
  message?: string;
};
