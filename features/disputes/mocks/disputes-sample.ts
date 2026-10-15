import type {
  DisputeDetail,
  DisputeEvidence,
  DisputeStatus,
  DisputeTimelineEvent,
} from "@/features/disputes/types";
import {
  SAMPLE_CURRENCY,
  SAMPLE_CUSTOMERS,
  SAMPLE_MECHANICS,
  SAMPLE_SERVICES,
  createRandom,
  daysAgo,
  sampleServiceRequestRef,
} from "@/mocks/sample-data";

const CATEGORIES = [
  {
    category: "Service quality",
    statement: "The brakes started squeaking again two days after the repair. I don't think the pads were replaced properly.",
  },
  {
    category: "Overcharge",
    statement: "I was quoted a lower price in the app, but the final amount charged was much higher than agreed.",
  },
  {
    category: "Vehicle damage",
    statement: "There is a new scratch on the driver's door that was not there before the mechanic worked on the car.",
  },
  {
    category: "Incomplete work",
    statement: "The mechanic left before finishing the AC repair. It still blows warm air.",
  },
  {
    category: "Mechanic no-show",
    statement: "The mechanic marked the Service Request as arrived but never came. I waited over an hour.",
  },
] as const;

const STATUS_PLAN: DisputeStatus[] = [
  "under_review", "open", "open", "resolved", "under_review", "open", "resolved",
  "resolved", "open", "under_review", "resolved", "open", "resolved", "under_review",
];

function evidence(id: string, fileName: string, mimeType: string, sizeBytes: number, uploadedBy: DisputeEvidence["uploadedBy"], uploadedAt: string): DisputeEvidence {
  return { id, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt };
}

function buildDispute(index: number): DisputeDetail {
  const random = createRandom(3100 + index * 17);
  const id = `dsp_sample_${String(index + 1).padStart(3, "0")}`;
  const status = STATUS_PLAN[index % STATUS_PLAN.length];
  const openedDaysAgo = 2 + index * 4;
  const { category, statement } = CATEGORIES[index % CATEGORIES.length];
  const mechanic = random.pick(SAMPLE_MECHANICS);
  const amount = random.amount(180, 1400);
  const openedAt = daysAgo(openedDaysAgo, 11, 15);
  const serviceDate = daysAgo(openedDaysAgo + 1, 9, 30);
  const hasResponded = status !== "open";

  const timeline: DisputeTimelineEvent[] = [
    { id: `${id}-t1`, type: "opened", label: "Dispute opened by customer", actor: "customer", at: openedAt, note: category },
    { id: `${id}-t2`, type: "payout_held", label: "Mechanic payout placed on hold", actor: "sherix", at: daysAgo(openedDaysAgo, 11, 16) },
  ];
  const evidenceItems: DisputeEvidence[] = [
    evidence(`${id}-e1`, "customer-photo-1.jpg", "image/jpeg", random.int(900_000, 2_800_000), "customer", openedAt),
  ];

  if (index % 2 === 0) {
    evidenceItems.push(evidence(`${id}-e2`, "payment-receipt.pdf", "application/pdf", random.int(80_000, 300_000), "customer", openedAt));
  }

  let companyResponse: DisputeDetail["companyResponse"] = null;
  if (hasResponded) {
    const respondedAt = daysAgo(openedDaysAgo - 1, 14, 5);
    companyResponse = {
      message: `Our mechanic ${mechanic.name} completed the work as agreed and the customer signed off on completion. We've attached the Service Request photos and the itemised invoice.`,
      submittedAt: respondedAt,
      submittedBy: "Company admin",
    };
    evidenceItems.push(evidence(`${id}-e3`, "service-request-completion-photo.png", "image/png", random.int(700_000, 2_100_000), "company", respondedAt));
    timeline.push(
      { id: `${id}-t3`, type: "company_responded", label: "Company responded with evidence", actor: "company", at: respondedAt },
      { id: `${id}-t4`, type: "status_changed", label: "Moved to review by Sherix", actor: "sherix", at: daysAgo(openedDaysAgo - 1, 16, 40) },
    );
  }

  let resolution: DisputeDetail["resolution"] = null;
  if (status === "resolved") {
    const resolvedAt = daysAgo(Math.max(0, openedDaysAgo - 3), 12);
    const refund = index % 3 === 0;
    resolution = refund
      ? {
          outcome: "partial_refund",
          summary: "Evidence showed part of the work needed redoing. The customer received a partial refund; the rest was released to the company.",
          refundAmount: Math.round(amount * 0.4 * 100) / 100,
          resolvedAt,
        }
      : {
          outcome: "release_to_company",
          summary: "The company's evidence confirmed the work was completed as agreed. The held payout was released.",
          refundAmount: null,
          resolvedAt,
        };
    timeline.push({ id: `${id}-t5`, type: "resolved", label: "Dispute resolved by Sherix", actor: "sherix", at: resolvedAt, note: resolution.summary });
  }

  return {
    id,
    reference: `DSP-${String(7300 + index)}`,
    status,
    category,
    customerStatement: statement,
    serviceRequest: {
      id: `sr_sample_${String(index + 1).padStart(3, "0")}`,
      reference: sampleServiceRequestRef(index + 40),
      serviceName: random.pick(SAMPLE_SERVICES),
      date: serviceDate,
      amount: Math.round(amount * 1.1 * 100) / 100,
    },
    customerName: random.pick(SAMPLE_CUSTOMERS),
    mechanic: { ...mechanic },
    amountInDispute: amount,
    currency: SAMPLE_CURRENCY,
    openedAt,
    updatedAt: timeline[timeline.length - 1].at,
    responseDueAt: status === "open" ? daysAgo(openedDaysAgo - 3, 23, 59) : null,
    paymentStatus: resolution?.outcome === "partial_refund" ? "partially_refunded" : "paid",
    payoutStatus: status === "resolved" ? "released" : "on_hold",
    timeline,
    evidence: evidenceItems,
    companyResponse,
    resolution,
  };
}

/** Mutable in-memory store so submitted responses persist for the session. */
export const sampleDisputes: DisputeDetail[] = Array.from({ length: 14 }, (_, index) => buildDispute(index));
