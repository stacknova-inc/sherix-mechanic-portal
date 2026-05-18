export type EmployeeStatus = "AVAILABLE" | "ON_JOB" | "OFFLINE";

export type ExperienceLevel =
  | "1-3 years"
  | "3-5 years"
  | "5-10 years"
  | "10+ years";

export type ServiceSpecialty =
  | "Engine"
  | "Diagnostics"
  | "Brakes"
  | "Electrical"
  | "Transmission"
  | "Bodywork";

export interface Employee {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  serviceSpecialties: ServiceSpecialty[];
  dateOfBirth: string;
  experienceLevel: ExperienceLevel;
  profilePhotoUrl: string | null;
  status: EmployeeStatus;
  jobsCompleted: number;
  onboardedDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt">;

export interface EmployeeStats {
  total: number;
  available: number;
  onJob: number;
  offline: number;
}

export interface EmployeeFilters {
  searchTerm: string;
  serviceType: ServiceSpecialty | "all";
  status: EmployeeStatus | "all";
  sortBy: EmployeeSortKey;
}

export type EmployeeSortKey =
  | "mostActive"
  | "leastActive"
  | "nameAsc"
  | "nameDesc"
  | "jobsHigh"
  | "jobsLow";
