export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "In Review"
  | "Completed";

export type RequestPriority = "Low" | "Medium" | "High" | "Urgent";

export interface AdminRequest {
  id: string;
  employeeName: string;
  department: string;
  requestType: string;
  date: string;
  priority: RequestPriority;
  status: RequestStatus;
  assignedTo: string;
}

export type RequestSortKey =
  | "id"
  | "employeeName"
  | "department"
  | "requestType"
  | "date"
  | "priority"
  | "status"
  | "assignedTo";
