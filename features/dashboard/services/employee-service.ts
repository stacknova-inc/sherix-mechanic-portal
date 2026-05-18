import { mockEmployees } from "@/features/dashboard/mocks/employee-mock-data";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeStats,
} from "@/features/dashboard/types/employee";

let employees: Employee[] = [...mockEmployees];
let nextId = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getEmployees(): Promise<Employee[]> {
  await wait(300);
  return [...employees];
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  await wait(300);

  const now = new Date().toISOString();
  const newEmployee: Employee = {
    id: `emp-${String(nextId++).padStart(3, "0")}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  employees = [...employees, newEmployee];
  return newEmployee;
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  await wait(100);
  return employees.find((employee) => employee.id === id) ?? null;
}

export async function updateEmployee(
  id: string,
  data: Partial<CreateEmployeeInput>,
): Promise<Employee | null> {
  await wait(300);

  const existingEmployee = employees.find((employee) => employee.id === id);
  if (!existingEmployee) {
    return null;
  }

  const updatedEmployee: Employee = {
    ...existingEmployee,
    ...data,
    id: existingEmployee.id,
    createdAt: existingEmployee.createdAt,
    updatedAt: new Date().toISOString(),
  };

  employees = employees.map((employee) =>
    employee.id === id ? updatedEmployee : employee,
  );

  return updatedEmployee;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  await wait(300);

  const employeeExists = employees.some((employee) => employee.id === id);
  if (!employeeExists) {
    return false;
  }

  employees = employees.filter((employee) => employee.id !== id);
  return true;
}

export async function getEmployeeStats(): Promise<EmployeeStats> {
  await wait(200);

  return employees.reduce<EmployeeStats>(
    (stats, employee) => {
      stats.total += 1;

      if (employee.status === "AVAILABLE") {
        stats.available += 1;
      }

      if (employee.status === "ON_JOB") {
        stats.onJob += 1;
      }

      if (employee.status === "OFFLINE") {
        stats.offline += 1;
      }

      return stats;
    },
    { total: 0, available: 0, onJob: 0, offline: 0 },
  );
}
