import { apiClient } from "@/services/http-client";
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
  profilePhoto?: string | null;
  profile_photo?: string | null;
  profilePhotoUrl?: string | null;
  profile_photo_url?: string | null;
  services?: Array<string | BackendEmployeeService>;
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

function normalizeEmployee(employee: BackendEmployee): Employee {
  const id = employee._id ?? employee.id ?? "";
  const name = employee.name ?? employee.fullName ?? employee.full_name ?? "Unnamed employee";
  const services = (employee.services ?? []).map(normalizeEmployeeService);
  const isActive = employee.isActive ?? !employee.deactivatedAt;
  const status = !isActive ? "SUSPENDED" : (employee.status as Employee["status"]) ?? "AVAILABLE";
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
    profilePhotoUrl:
      employee.profilePhotoUrl ??
      employee.profile_photo_url ??
      employee.profilePhoto ??
      employee.profile_photo ??
      null,
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
  const response = await apiClient.get<BackendEmployeesResponse>("/employees/", {
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

export function getEmployeeStats(employees: Employee[]): EmployeeStats {
  return employees.reduce<EmployeeStats>(
    (stats, employee) => {
      stats.total += 1;

      if (employee.status === "AVAILABLE") {
        stats.available += 1;
      }

      if (employee.status === "ON_JOB") {
        stats.onJob += 1;
      }

      if (employee.status === "OFFLINE" || employee.status === "SUSPENDED") {
        stats.offline += 1;
      }

      return stats;
    },
    { total: 0, available: 0, onJob: 0, offline: 0 },
  );
}
