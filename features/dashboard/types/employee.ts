export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type ExperienceLevel =
  | "1-3 years"
  | "3-5 years"
  | "5-10 years"
  | "10+ years";

export type ServiceSpecialty = string;

export interface EmployeeServiceSummary {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  fullName: string;
  name?: string;
  phoneNumber: string;
  email: string | null;
  serviceSpecialties: ServiceSpecialty[];
  services?: EmployeeServiceSummary[];
  /** Service issues this employee handles (GET /issues/company). */
  issues: EmployeeServiceSummary[];
  dateOfBirth: string;
  experienceLevel: ExperienceLevel;
  levelOfExperience?: ExperienceLevel;
  profilePhotoUrl: string | null;
  status: EmployeeStatus;
  isActive?: boolean;
  jobsCompleted: number;
  onboardedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormValues {
  name: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  levelOfExperience: ExperienceLevel;
  serviceIds: string[];
  issueIds: string[];
  profilePhoto?: FileList | null;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmployeeStatus | "all";
  serviceId?: string | "all";
}

export interface PaginatedEmployees {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateEmployeeInput = EmployeeFormValues;
export type UpdateEmployeeInput = Omit<EmployeeFormValues, "profilePhoto"> & {
  profilePhoto?: FileList | null;
};

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
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
