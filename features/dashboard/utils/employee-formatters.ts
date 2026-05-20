import type {
  Employee,
  EmployeeFilters,
  EmployeeStatus,
  ServiceSpecialty,
} from "@/features/dashboard/types/employee";

export function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatEmployeeStatus(status: EmployeeStatus): string {
  return status === "ON_JOB" ? "ON JOB" : status;
}

export function getEmployeeStatusClasses(status: EmployeeStatus): string {
  const classes: Record<EmployeeStatus, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    ON_JOB: "bg-blue-100 text-blue-800",
    OFFLINE: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };

  return classes[status];
}

export function getSpecialtyClasses(specialty: ServiceSpecialty): string {
  const classes: Record<string, string> = {
    Engine: "bg-red-100 text-red-800",
    Diagnostics: "bg-blue-100 text-blue-800",
    Brakes: "bg-purple-100 text-purple-800",
    Electrical: "bg-yellow-100 text-yellow-800",
    Transmission: "bg-green-100 text-green-800",
    Bodywork: "bg-orange-100 text-orange-800",
  };

  return classes[specialty] ?? "bg-gray-100 text-gray-800";
}

export function filterAndSortEmployees(
  employees: Employee[],
  filters: EmployeeFilters,
): Employee[] {
  const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      employee.fullName.toLowerCase().includes(normalizedSearchTerm) ||
      employee.phoneNumber.includes(normalizedSearchTerm) ||
      (employee.email?.toLowerCase().includes(normalizedSearchTerm) ?? false) ||
      employee.serviceSpecialties.some((specialty) =>
        specialty.toLowerCase().includes(normalizedSearchTerm),
      );

    const matchesService =
      filters.serviceType === "all" ||
      employee.serviceSpecialties.includes(filters.serviceType) ||
      (employee.services?.some((service) => service.id === filters.serviceType) ??
        false);

    const matchesStatus =
      filters.status === "all" || employee.status === filters.status;

    return matchesSearch && matchesService && matchesStatus;
  });

  return [...filteredEmployees].sort((firstEmployee, secondEmployee) => {
    switch (filters.sortBy) {
      case "leastActive":
      case "jobsLow":
        return firstEmployee.jobsCompleted - secondEmployee.jobsCompleted;
      case "nameAsc":
        return firstEmployee.fullName.localeCompare(secondEmployee.fullName);
      case "nameDesc":
        return secondEmployee.fullName.localeCompare(firstEmployee.fullName);
      case "jobsHigh":
      case "mostActive":
      default:
        return secondEmployee.jobsCompleted - firstEmployee.jobsCompleted;
    }
  });
}
