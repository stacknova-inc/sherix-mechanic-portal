import { sampleDisputes } from "@/features/disputes/mocks/disputes-sample";
import type {
  DisputeDetail,
  DisputeListParams,
  DisputeResponseInput,
  DisputeStatusCounts,
  DisputeSummary,
} from "@/features/disputes/types";
import { mockRequest, paginateMock } from "@/mocks/mock-request";

function toSummary(dispute: DisputeDetail): DisputeSummary {
  return {
    id: dispute.id,
    reference: dispute.reference,
    status: dispute.status,
    category: dispute.category,
    serviceRequest: {
      id: dispute.serviceRequest.id,
      reference: dispute.serviceRequest.reference,
      serviceName: dispute.serviceRequest.serviceName,
    },
    customerName: dispute.customerName,
    mechanic: dispute.mechanic,
    amountInDispute: dispute.amountInDispute,
    currency: dispute.currency,
    openedAt: dispute.openedAt,
    updatedAt: dispute.updatedAt,
    responseDueAt: dispute.responseDueAt,
  };
}

function matchesSearch(dispute: DisputeDetail, search: string) {
  const query = search.trim().toLowerCase();
  return (
    !query ||
    [dispute.reference, dispute.serviceRequest.reference, dispute.customerName, dispute.mechanic.name, dispute.category]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

export class DisputeNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("This dispute was not found, or it isn't linked to your company.");
  }
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/disputes
 * Query: status?: "open" | "under_review" | "resolved", search?: string (dispute ref, Service Request ref,
 *        customer, mechanic), page?: number, limit?: number
 * Response: {
 *   data: [{ id, reference, status, category, serviceRequest: { id, reference, serviceName },
 *            customerName, mechanic: { id, name }, amountInDispute, currency,
 *            openedAt, updatedAt, responseDueAt | null }],
 *   pagination: { total, page, limit, pages },
 *   counts: { all, open, under_review, resolved }     // unaffected by the status filter, for tabs
 * }
 * Sorted by most recently updated. Only disputes on Service Requests assigned to the company.
 */
export async function getDisputes(
  params: DisputeListParams = {},
): Promise<ReturnType<typeof paginateMock<DisputeSummary>> & { counts: DisputeStatusCounts }> {
  return mockRequest("disputes", () => {
    const searched = sampleDisputes.filter((dispute) => matchesSearch(dispute, params.search ?? ""));
    const filtered = searched
      .filter((dispute) => !params.status || dispute.status === params.status)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
      .map(toSummary);

    return {
      ...paginateMock(filtered, params.page, params.limit),
      counts: {
        all: searched.length,
        open: searched.filter((dispute) => dispute.status === "open").length,
        under_review: searched.filter((dispute) => dispute.status === "under_review").length,
        resolved: searched.filter((dispute) => dispute.status === "resolved").length,
      },
    };
  });
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/disputes/:id
 * Response: DisputeSummary fields plus {
 *   customerStatement,
 *   serviceRequest: { id, reference, serviceName, date, amount },
 *   paymentStatus: "paid" | "refunded" | "partially_refunded",
 *   payoutStatus: "on_hold" | "released" | "withheld",
 *   timeline: [{ id, type, label, actor: "customer" | "company" | "mechanic" | "sherix", at, note? }],
 *   evidence: [{ id, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt }],   // no raw file URLs
 *   companyResponse: { message, submittedAt, submittedBy } | null,
 *   resolution: { outcome, summary, refundAmount | null, resolvedAt } | null
 * }
 * 404 when the dispute is not on a Service Request assigned to the company.
 */
export async function getDispute(id: string): Promise<DisputeDetail> {
  return mockRequest("disputes", () => {
    const dispute = sampleDisputes.find((item) => item.id === id);
    if (!dispute) {
      throw new DisputeNotFoundError();
    }
    return dispute;
  });
}

export class DisputeClosedError extends Error {
  readonly status = 409;

  constructor() {
    super("This dispute has been resolved and can no longer be changed.");
  }
}

/**
 * TODO: connect to backend — expected endpoint: POST /company/disputes/:id/responses
 * Body: multipart/form-data — message: string (20–2000 chars), evidence[]: File (0–5 files;
 *       JPG/PNG/WEBP/PDF; ≤ 10 MB each — limits to be confirmed by backend)
 * Use axios `onUploadProgress` to drive the progress bar (the `onProgress` callback below mirrors it).
 * Response: the updated DisputeDetail (same shape as GET /company/disputes/:id).
 * 409 when the dispute is resolved; 403 without dispute-response permission; 413/422 for invalid files.
 */
export async function submitDisputeResponse(
  id: string,
  input: DisputeResponseInput,
  onProgress?: (percent: number) => void,
): Promise<DisputeDetail> {
  // Simulated upload progress; the real call reports it via axios onUploadProgress.
  const steps = process.env.NODE_ENV === "test" ? [100] : [8, 23, 41, 58, 74, 90, 100];
  for (const percent of steps) {
    await new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : 180));
    onProgress?.(percent);
  }

  return mockRequest("disputes", () => {
    const dispute = sampleDisputes.find((item) => item.id === id);
    if (!dispute) {
      throw new DisputeNotFoundError();
    }
    if (dispute.status === "resolved") {
      throw new DisputeClosedError();
    }

    const now = new Date().toISOString();
    dispute.companyResponse = { message: input.message.trim(), submittedAt: now, submittedBy: "You" };
    input.files.forEach((file, index) => {
      dispute.evidence.push({
        id: `${id}-upload-${Date.now()}-${index}`,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedBy: "company",
        uploadedAt: now,
      });
    });
    dispute.timeline.push({
      id: `${id}-response-${Date.now()}`,
      type: "company_responded",
      label: input.files.length
        ? `Company responded with ${input.files.length} evidence file${input.files.length === 1 ? "" : "s"}`
        : "Company responded",
      actor: "company",
      at: now,
    });
    if (dispute.status === "open") {
      dispute.status = "under_review";
      dispute.responseDueAt = null;
    }
    dispute.updatedAt = now;

    return dispute;
  }, 0);
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/disputes/:id/evidence/:evidenceId/download
 * Response: { url: string, expiresAt: ISO datetime }  // short-lived, authorized, Content-Disposition: attachment
 * The UI opens the returned URL; it never renders evidence files inline from a permanent public URL.
 */
export async function getEvidenceDownloadUrl(disputeId: string, evidenceId: string): Promise<{ url: string; expiresAt: string }> {
  return mockRequest("disputes", () => {
    throw new Error(`Sample evidence (${evidenceId}) can't be downloaded until the backend is connected.`);
  });
}
