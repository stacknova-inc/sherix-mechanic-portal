export type SignupStep = 1 | 2 | 3;

export type UploadedFileKey =
  | "registrationCertificate"
  | "garageProof"
  | "businessInsurance"
  | "ghanaCard"
  | "insuranceUpload";

export type SignupFormData = {
  companyName: string;
  businessEmail: string;
  companyNumber: string;
  coverage_area: string;
  fullName: string;
  personalEmail: string;
  password: string;
  confirmPassword: string;
  servicesOffered: string[];
  workingHours: string;
  signedAgreementAccepted: boolean;
};

export type SignupFiles = Partial<Record<UploadedFileKey, File | null>>;

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
  serviceId?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  message?: string;
};
