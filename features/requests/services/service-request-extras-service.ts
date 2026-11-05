import { buildBreakdown, sampleMechanicShare } from "@/features/earnings/mocks/earnings-sample";
import type { LegacyCommissionBreakdown, PayoutStatus } from "@/features/earnings/types";
import { mockRequest } from "@/mocks/mock-request";
import { SAMPLE_CURRENCY, createRandom } from "@/mocks/sample-data";

export type ServiceRequestEventType =
  | "created"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "payment_received"
  | "payout_scheduled";

export interface ServiceRequestTimelineEvent {
  id: string;
  type: ServiceRequestEventType;
  label: string;
  at: string;
  actor: string;
}

export interface ServiceRequestExtras {
  timeline: ServiceRequestTimelineEvent[];
  financials: {
    currency: string;
    transactionReference: string;
    breakdown: LegacyCommissionBreakdown;
    payoutStatus: PayoutStatus;
  } | null;
  dispute: { id: string; status: "open" | "under_review" | "resolved" } | null;
}

const STEPS: Array<{ type: ServiceRequestEventType; label: string; actor: string; minutes: number }> = [
  { type: "created", label: "Service Request created", actor: "Customer", minutes: 0 },
  { type: "assigned", label: "Assigned to mechanic", actor: "Sherix dispatch", minutes: 2 },
  { type: "accepted", label: "Mechanic accepted", actor: "Mechanic", minutes: 6 },
  { type: "en_route", label: "Mechanic en route", actor: "Mechanic", minutes: 9 },
  { type: "arrived", label: "Mechanic arrived", actor: "Mechanic", minutes: 34 },
  { type: "in_progress", label: "Work started", actor: "Mechanic", minutes: 41 },
  { type: "completed", label: "Work completed", actor: "Mechanic", minutes: 118 },
  { type: "payment_received", label: "Customer payment received", actor: "Payments", minutes: 121 },
  { type: "payout_scheduled", label: "Mechanic payout scheduled", actor: "Payments", minutes: 1440 },
];

function seedFromId(id: string) {
  return Array.from(id).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 17);
}


export async function getServiceRequestExtras(
  serviceRequestId: string,
  context: { status: string | null; date: string | null; mechanicId: string | null },
): Promise<ServiceRequestExtras> {
  return mockRequest("service-request-extras", () => {
    const random = createRandom(seedFromId(serviceRequestId));
    const start = new Date(context.date ?? Date.now() - 3 * 86_400_000).getTime();
    const isCompleted = context.status === "completed";
    const isCancelled = context.status === "cancelled";
    const reached = isCompleted ? STEPS.length : isCancelled ? 3 : random.int(2, 6);

    const timeline: ServiceRequestTimelineEvent[] = STEPS.slice(0, reached).map((step, index) => ({
      id: `${serviceRequestId}-event-${index}`,
      type: step.type,
      label: step.label,
      actor: step.actor,
      at: new Date(start + step.minutes * 60_000).toISOString(),
    }));

    if (isCancelled) {
      timeline.push({
        id: `${serviceRequestId}-event-cancelled`,
        type: "created",
        label: "Service Request cancelled",
        actor: "Customer",
        at: new Date(start + 15 * 60_000).toISOString(),
      });
    }

    return {
      timeline,
      financials: isCompleted
        ? {
            currency: SAMPLE_CURRENCY,
            transactionReference: `TXN-${String(seedFromId(serviceRequestId) % 900000 + 100000)}`,
            breakdown: buildBreakdown(random.amount(150, 1600), sampleMechanicShare(context.mechanicId ?? "")),
            payoutStatus: random.next() < 0.7 ? "paid" : "processing",
          }
        : null,
      dispute: isCompleted && random.next() < 0.15 ? { id: "dsp_sample_001", status: "under_review" } : null,
    };
  });
}
