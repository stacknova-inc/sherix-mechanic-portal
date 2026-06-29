import type {
  EmployeeSortKey,
  EmployeeStatus,
  ExperienceLevel,
  ServiceSpecialty,
} from "@/features/dashboard/types/employee";

export const SERVICE_SPECIALTIES: ServiceSpecialty[] = [
  "Engine",
  "Diagnostics",
  "Brakes",
  "Electrical",
  "Transmission",
  "Bodywork",
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

export const EMPLOYEE_STATUSES: EmployeeStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
];

export const EMPLOYEE_SORT_OPTIONS: Array<{ label: string; value: EmployeeSortKey }> = [
  { label: "Most Active", value: "mostActive" },
  { label: "Least Active", value: "leastActive" },
  { label: "Name A-Z", value: "nameAsc" },
  { label: "Name Z-A", value: "nameDesc" },
  { label: "Most Jobs", value: "jobsHigh" },
  { label: "Least Jobs", value: "jobsLow" },
];

export const DEFAULT_EMPLOYEE_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
