import { apiClient } from "@/services/http-client";
import type { IssueOption } from "@/types/service";

type BackendIssue = {
  _id?: string;
  id?: string;
  issueTitle?: string;
  title?: string;
  name?: string;
  service?: string | { _id?: string; id?: string } | null;
  serviceId?: string | { _id?: string; id?: string } | null;
  isActive?: boolean;
};

type BackendIssuesResponse =
  | BackendIssue[]
  | { data?: BackendIssue[] | { issues?: BackendIssue[] }; issues?: BackendIssue[] };

function unwrapIssues(response: BackendIssuesResponse): BackendIssue[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.issues ?? response.issues ?? [];
}

function getRefId(ref: BackendIssue["service"]): string | null {
  if (!ref) {
    return null;
  }

  return typeof ref === "string" ? ref : ref._id ?? ref.id ?? null;
}

function normalizeIssue(issue: BackendIssue): IssueOption | null {
  const id = issue._id ?? issue.id;
  const name = issue.issueTitle ?? issue.title ?? issue.name;

  if (!id || !name || issue.isActive === false) {
    return null;
  }

  return { id, name, serviceId: getRefId(issue.service ?? issue.serviceId) };
}

/** GET /issues/company — issues for the services the company offers. */
export async function getCompanyIssues(): Promise<IssueOption[]> {
  const response = await apiClient.get<BackendIssuesResponse>("/issues/company");

  return unwrapIssues(response.data)
    .map(normalizeIssue)
    .filter((issue): issue is IssueOption => Boolean(issue));
}
