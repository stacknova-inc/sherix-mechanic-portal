import { apiClient } from "@/services/http-client";
import { API_BASE_URL } from "@/services/api-config";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeListParams,
  EmployeeServiceSummary,
  EmployeeStats,
  ExperienceLevel,
  PaginatedEmployees,
  UpdateEmployeeInput,
} from "@/features/dashboard/types/employee";

type BackendEmployeeService = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
};

type BackendEmployee = {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  phoneNumber?: string;
  phone_number?: string;
  phone?: string;
  email?: string | null;
  dateOfBirth?: string;
  date_of_birth?: string;
  levelOfExperience?: ExperienceLevel;
  level_of_experience?: ExperienceLevel;
  experienceLevel?: ExperienceLevel;
  profilePhoto?: unknown;
  profile_photo?: unknown;
  profilePhotoUrl?: unknown;
  profile_photo_url?: unknown;
  services?: unknown;
  status?: string;
  isActive?: boolean;
  deactivatedAt?: string | null;
  jobsCompleted?: number;
  onboardedDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BackendEmployeesResponse =
  | BackendEmployee[]
  | {
      data?:
        | BackendEmployee[]
        | {
            employees?: BackendEmployee[];
            docs?: BackendEmployee[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
      employees?: BackendEmployee[];
      docs?: BackendEmployee[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };

type BackendEmployeeResponse =
  | BackendEmployee
  | {
      data?: BackendEmployee;
      employee?: BackendEmployee;
    };

function normalizeEmployeeService(
  service: string | BackendEmployeeService,
): EmployeeServiceSummary {
  if (typeof service === "string") {
    return { id: service, name: service };
  }

  return {
    id: service._id ?? service.id ?? "",
    name: service.name ?? service.title ?? "Unnamed service",
  };
}

function normalizeEmployeeServices(services: unknown): EmployeeServiceSummary[] {
  if (!Array.isArray(services)) {
    return [];
  }

  return services
    .filter(
      (service): service is string | BackendEmployeeService =>
        typeof service === "string" ||
        (Boolean(service) && typeof service === "object"),
    )
    .map(normalizeEmployeeService)
    .filter((service) => Boolean(service.id || service.name));
}

function normalizeEmployeeStatus(
  status: string | undefined,
  isActive: boolean,
): Employee["status"] {
  const normalizedStatus = status?.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (normalizedStatus === "SUSPENDED") {
    return "SUSPENDED";
  }

  if (normalizedStatus === "INACTIVE" || normalizedStatus === "OFFLINE") {
    return "INACTIVE";
  }

  if (normalizedStatus === "ACTIVE" || normalizedStatus === "AVAILABLE" || normalizedStatus === "ON_JOB") {
    return "ACTIVE";
  }

  return isActive ? "ACTIVE" : "INACTIVE";
}

function extractProfilePhotoUrl(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractProfilePhotoUrl(item);

      if (url) {
        return url;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    const photo = value as Record<string, unknown>;

    return (
      extractProfilePhotoUrl(photo.url) ??
      extractProfilePhotoUrl(photo.secure_url) ??
      extractProfilePhotoUrl(photo.href) ??
      extractProfilePhotoUrl(photo.path) ??
      extractProfilePhotoUrl(photo.location) ??
      extractProfilePhotoUrl(photo.Location) ??
      extractProfilePhotoUrl(photo.key) ??
      null
    );
  }

  return null;
}

function normalizeProfilePhotoUrl(value: unknown): string | null {
  const url = extractProfilePhotoUrl(value);

  if (!url) {
    return null;
  }

  const normalizedUrl = url.replace(/\\/g, "/");

  if (/^(https?:|data:|blob:)/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  try {
    return new URL(normalizedUrl, API_BASE_URL).toString();
  } catch {
    return normalizedUrl;
  }
}

function normalizeEmployee(employee: BackendEmployee): Employee {
  const id = employee._id ?? employee.id ?? "";
  const name = employee.name ?? employee.fullName ?? employee.full_name ?? "Unnamed employee";
  const services = normalizeEmployeeServices(employee.services);
  const isActive = employee.isActive ?? !employee.deactivatedAt;
  const status = normalizeEmployeeStatus(employee.status, isActive);
  const createdAt = employee.createdAt ?? new Date().toISOString();

  return {
    id,
    name,
    fullName: name,
    phoneNumber: employee.phoneNumber ?? employee.phone_number ?? employee.phone ?? "",
    email: employee.email ?? null,
    services,
    serviceSpecialties: services.map((service) => service.name),
    dateOfBirth: employee.dateOfBirth ?? employee.date_of_birth ?? "",
    levelOfExperience:
      employee.levelOfExperience ??
      employee.level_of_experience ??
      employee.experienceLevel ??
      "1-3 years",
    experienceLevel:
      employee.levelOfExperience ??
      employee.level_of_experience ??
      employee.experienceLevel ??
      "1-3 years",
    profilePhotoUrl: normalizeProfilePhotoUrl(
      employee.profilePhotoUrl ??
      employee.profile_photo_url ??
      employee.profilePhoto ??
      employee.profile_photo ??
      null,
    ),
    status,
    isActive,
    jobsCompleted: employee.jobsCompleted ?? 0,
    onboardedDate: employee.onboardedDate ?? createdAt.split("T")[0],
    createdAt,
    updatedAt: employee.updatedAt ?? createdAt,
  };
}

function normalizeEmployeeResponse(response: BackendEmployeeResponse): Employee {
  const responseWithContainer = response as {
    data?: BackendEmployee;
    employee?: BackendEmployee;
  };
  const rawEmployee =
    responseWithContainer.data ??
    responseWithContainer.employee ??
    (response as BackendEmployee);

  if (!rawEmployee) {
    throw new Error("Employee response did not include an employee.");
  }

  return normalizeEmployee(rawEmployee);
}

function normalizeEmployeesResponse(
  response: BackendEmployeesResponse,
  fallbackParams?: EmployeeListParams,
): PaginatedEmployees {
  const container = Array.isArray(response) ? undefined : response;
  const dataContainer = !Array.isArray(response) && !Array.isArray(response.data)
    ? response.data
    : undefined;
  const rawEmployees = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : dataContainer?.employees ??
        dataContainer?.docs ??
        response.employees ??
        response.docs ??
        [];

  const employees = rawEmployees.map(normalizeEmployee);
  const total = dataContainer?.total ?? container?.total ?? employees.length;
  const page = dataContainer?.page ?? container?.page ?? fallbackParams?.page ?? 1;
  const limit =
    dataContainer?.limit ??
    container?.limit ??
    fallbackParams?.limit ??
    employees.length;

  return {
    employees,
    total,
    page,
    limit,
    totalPages:
      dataContainer?.totalPages ??
      container?.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  };
}

function buildEmployeeFormData(
  input: CreateEmployeeInput | UpdateEmployeeInput,
  includePhoto: boolean,
) {
  const formData = new FormData();

  formData.append("name", input.name.trim());
  formData.append("phoneNumber", input.phoneNumber.trim());
  formData.append("email", input.email.trim());
  formData.append("dateOfBirth", input.dateOfBirth);
  formData.append("levelOfExperience", input.levelOfExperience);

  input.serviceIds.forEach((serviceId) => {
    formData.append("services", serviceId);
  });

  const photo = input.profilePhoto?.[0];
  if (includePhoto && photo instanceof File) {
    formData.append("profilePhoto", photo);
  }

  return formData;
}

export async function getEmployees(
  params: EmployeeListParams = {},
): Promise<PaginatedEmployees> {
  const response = await apiClient.get<BackendEmployeesResponse>("/employees", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status === "all" ? undefined : params.status,
      service: params.serviceId === "all" ? undefined : params.serviceId,
    },
  });

  return normalizeEmployeesResponse(response.data, params);
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  console.info("[Employees][Create] Creating employee", {
    fullName: input.name.trim(),
    phoneNumber: input.phoneNumber.trim(),
    email: input.email.trim(),
    dateOfBirth: input.dateOfBirth,
    levelOfExperience: input.levelOfExperience,
    serviceIds: input.serviceIds,
    hasProfilePhoto: input.profilePhoto?.[0] instanceof File,
  });

  const response = await apiClient.post<BackendEmployeeResponse>(
    "/employees",
    buildEmployeeFormData(input, true),
  );

  return normalizeEmployeeResponse(response.data);
}

export async function updateEmployee(
  employeeId: string,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const response = await apiClient.put<BackendEmployeeResponse>(
    `/employees/${employeeId}`,
    buildEmployeeFormData(input, false),
  );

  return normalizeEmployeeResponse(response.data);
}

export async function deactivateEmployee(employeeId: string): Promise<Employee> {
  const response = await apiClient.patch<BackendEmployeeResponse>(
    `/employees/${employeeId}/deactivate`,
  );

  return normalizeEmployeeResponse(response.data);
}

export async function reactivateEmployee(employeeId: string): Promise<Employee> {
  const response = await apiClient.patch<BackendEmployeeResponse>(
    `/employees/${employeeId}/reactivate`,
  );

  return normalizeEmployeeResponse(response.data);
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await apiClient.delete(`/employees/${employeeId}`);
}

export function getEmployeeStats(employees: Employee[]): EmployeeStats {
  return employees.reduce<EmployeeStats>(
    (stats, employee) => {
      stats.total += 1;

      if (employee.status === "ACTIVE") {
        stats.active += 1;
      }

      if (employee.status === "INACTIVE") {
        stats.inactive += 1;
      }

      if (employee.status === "SUSPENDED") {
        stats.suspended += 1;
      }

      return stats;
    },
    { total: 0, active: 0, inactive: 0, suspended: 0 },
  );
}
