import type { IssueOption } from "@/types/service";

/**
 * Issues an employee can be assigned: those belonging to one of their selected
 * services. Issues the backend returns without a service apply to any service.
 */
export function getAvailableIssues(issues: IssueOption[], serviceIds: string[]): IssueOption[] {
  if (serviceIds.length === 0) {
    return [];
  }

  return issues.filter((issue) => !issue.serviceId || serviceIds.includes(issue.serviceId));
}

/** Drops selected issues that no longer belong to a selected service. */
export function pruneIssueIds(issueIds: string[], issues: IssueOption[], serviceIds: string[]): string[] {
  const availableIds = new Set(getAvailableIssues(issues, serviceIds).map((issue) => issue.id));
  return issueIds.filter((issueId) => availableIds.has(issueId));
}
