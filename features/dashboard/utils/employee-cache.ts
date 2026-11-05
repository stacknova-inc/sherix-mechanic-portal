import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { Employee, PaginatedEmployees } from "@/features/dashboard/types/employee";

export const employeesRootQueryKey = ["employees"] as const;

/** The ["employees", ...] prefix holds both paginated lists and single-employee detail entries. */
type EmployeeCacheEntry = PaginatedEmployees | Employee | undefined;

function isPaginated(entry: NonNullable<EmployeeCacheEntry>): entry is PaginatedEmployees {
  return Array.isArray((entry as PaginatedEmployees).employees);
}

export function updateEmployeeInCaches(
  queryClient: QueryClient,
  employeeId: string,
  update: (employee: Employee) => Employee,
) {
  queryClient.setQueriesData<EmployeeCacheEntry>({ queryKey: employeesRootQueryKey }, (entry) => {
    if (!entry) {
      return entry;
    }

    if (isPaginated(entry)) {
      return {
        ...entry,
        employees: entry.employees.map((employee) => (employee.id === employeeId ? update(employee) : employee)),
      };
    }

    return entry.id === employeeId ? update(entry) : entry;
  });
}

export function removeEmployeeFromCaches(queryClient: QueryClient, employeeId: string) {
  queryClient.setQueriesData<EmployeeCacheEntry>({ queryKey: employeesRootQueryKey }, (entry) =>
    entry && isPaginated(entry)
      ? {
          ...entry,
          employees: entry.employees.filter((employee) => employee.id !== employeeId),
          total: Math.max(0, entry.total - 1),
        }
      : entry,
  );
}

export type EmployeeCacheSnapshot = Array<[QueryKey, EmployeeCacheEntry]>;

/** Cancels in-flight employee queries and snapshots them for rollback. */
export async function snapshotEmployeeCaches(queryClient: QueryClient): Promise<EmployeeCacheSnapshot> {
  await queryClient.cancelQueries({ queryKey: employeesRootQueryKey });
  return queryClient.getQueriesData<EmployeeCacheEntry>({ queryKey: employeesRootQueryKey });
}

export function restoreEmployeeCaches(queryClient: QueryClient, snapshot: EmployeeCacheSnapshot | undefined) {
  snapshot?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
}
