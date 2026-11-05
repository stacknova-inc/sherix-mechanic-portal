export type DisputeStatus = "open" | "under_review" | "resolved";

export type DisputeParty = "customer" | "company" | "mechanic" | "sherix";

export type DisputeTimelineEventType =
  | "opened"
  | "evidence_added"
  | "company_responded"
  | "status_changed"
  | "payout_held"
  | "resolved";

export interface DisputeTimelineEvent {
  id: string;
  type: DisputeTimelineEventType;
  label: string;
  actor: DisputeParty;
  at: string;
  note?: string;
}

export interface DisputeEvidence {
  id: string;
  fileName: string;
  /** MIME type as validated by the backend. */
  mimeType: string;
  sizeBytes: number;
  uploadedBy: DisputeParty;
  uploadedAt: string;
}

export interface DisputeResolution {
  outcome: "refund_customer" | "partial_refund" | "release_to_company" | "dismissed";
  summary: string;
  refundAmount: number | null;
  resolvedAt: string;
}

export interface DisputeSummary {
  id: string;
  reference: string;
  status: DisputeStatus;
  category: string;
  serviceRequest: { id: string; reference: string; serviceName: string };
  customerName: string;
  mechanic: { id: string; name: string };
  amountInDispute: number;
  currency: string;
  openedAt: string;
  updatedAt: string;
  /** Deadline for the company's response; null once responded or resolved. */
  responseDueAt: string | null;
}

export interface DisputeDetail extends DisputeSummary {
  customerStatement: string;
  serviceRequest: DisputeSummary["serviceRequest"] & { date: string; amount: number };
  paymentStatus: "paid" | "refunded" | "partially_refunded";
  payoutStatus: "on_hold" | "released" | "withheld";
  timeline: DisputeTimelineEvent[];
  evidence: DisputeEvidence[];
  companyResponse: { message: string; submittedAt: string; submittedBy: string } | null;
  resolution: DisputeResolution | null;
}

export interface DisputeListParams {
  status?: DisputeStatus | "";
  search?: string;
  page?: number;
  limit?: number;
}

export interface DisputeStatusCounts {
  all: number;
  open: number;
  under_review: number;
  resolved: number;
}

export interface DisputeResponseInput {
  message: string;
  files: File[];
}
