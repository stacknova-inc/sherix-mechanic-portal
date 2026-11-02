export interface ServiceOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface IssueOption {
  id: string;
  name: string;
  /** Service the issue belongs to, when the backend provides it. */
  serviceId: string | null;
}
