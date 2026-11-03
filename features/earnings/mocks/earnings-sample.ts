import type { MechanicRef, PayoutStatus } from "@/features/earnings/types";
import {
  SAMPLE_CURRENCY,
  SAMPLE_CUSTOMERS,
  SAMPLE_MECHANICS,
  SAMPLE_SERVICES,
  createRandom,
  daysAgo,
  roundMoney,
  sampleServiceRequestRef,
} from "@/mocks/sample-data";

interface SampleCompanyTransaction {
  id: string;
  reference: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  serviceName: string;
  customerName: string;
  mechanic: MechanicRef;
  status: "completed" | "pending" | "failed" | "refunded";
  paymentMethod: "card" | "mobile_money" | "cash";
  currency: string;
  createdAt: string;
  settledAt: string | null;
  breakdown: ReturnType<typeof buildBreakdown>;
}

interface SamplePayout {
  id: string;
  reference: string;
  mechanic: MechanicRef;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: string;
  initiatedAt: string;
  completedAt: string | null;
  failureReason: string | null;
  transactionIds: string[];
}

type SampleTransactionStatus = "completed" | "pending" | "failed" | "refunded";

/** Sample commission and split rates used to build the earnings sample data. */
const SAMPLE_PLATFORM_COMMISSION_RATE = 0.15;
const SAMPLE_PROCESSING_FEE_RATE = 0.019;
const SAMPLE_DEFAULT_MECHANIC_SHARE = 70;
const SAMPLE_MECHANIC_SHARE_OVERRIDES: Record<string, number> = {
  mech_sample_01: 75,
  mech_sample_04: 72.5,
};

export function sampleMechanicShare(mechanicId: string) {
  return SAMPLE_MECHANIC_SHARE_OVERRIDES[mechanicId] ?? SAMPLE_DEFAULT_MECHANIC_SHARE;
}

/** Builds a breakdown whose parts always sum to the gross amount. */
export function buildBreakdown(grossAmount: number, mechanicSharePercent: number) {
  const platformCommission = roundMoney(grossAmount * SAMPLE_PLATFORM_COMMISSION_RATE);
  const processingFee = roundMoney(grossAmount * SAMPLE_PROCESSING_FEE_RATE);
  const netAmount = roundMoney(grossAmount - platformCommission - processingFee);
  const mechanicPayout = roundMoney((netAmount * mechanicSharePercent) / 100);

  return {
    grossAmount,
    platformCommissionRate: SAMPLE_PLATFORM_COMMISSION_RATE,
    platformCommission,
    processingFee,
    netAmount,
    mechanicSharePercent,
    mechanicPayout,
    companyShare: roundMoney(netAmount - mechanicPayout),
  };
}

function pickStatus(roll: number, ageDays: number): SampleTransactionStatus {
  if (ageDays <= 3 && roll < 0.6) return "pending";
  if (roll < 0.08) return "failed";
  if (roll < 0.13) return "refunded";
  if (roll < 0.22) return "pending";
  return "completed";
}

function buildTransactions(): SampleCompanyTransaction[] {
  const random = createRandom(4201);
  const methods: SampleCompanyTransaction["paymentMethod"][] = ["card", "mobile_money", "mobile_money", "cash"];

  return Array.from({ length: 72 }, (_, index) => {
    const ageDays = Math.floor((index * 95) / 72);
    const mechanic = random.pick(SAMPLE_MECHANICS);
    const status = pickStatus(random.next(), ageDays);
    const createdAt = daysAgo(ageDays, random.int(7, 19), random.int(0, 59));

    return {
      id: `txn_sample_${String(index + 1).padStart(3, "0")}`,
      reference: `TXN-${String(880100 + index)}`,
      serviceRequestId: `sr_sample_${String(index + 1).padStart(3, "0")}`,
      serviceRequestRef: sampleServiceRequestRef(index),
      serviceName: random.pick(SAMPLE_SERVICES),
      customerName: random.pick(SAMPLE_CUSTOMERS),
      mechanic: { ...mechanic },
      status,
      paymentMethod: random.pick(methods),
      currency: SAMPLE_CURRENCY,
      createdAt,
      settledAt: status === "completed" ? daysAgo(Math.max(0, ageDays - 1), 16) : null,
      breakdown: buildBreakdown(random.amount(120, 1850), sampleMechanicShare(mechanic.id)),
    };
  });
}

/** One payout per mechanic per week, built from that week's transactions so totals reconcile. */
function buildPayouts(transactions: SampleCompanyTransaction[]): SamplePayout[] {
  const random = createRandom(977);
  const groups = new Map<string, SampleCompanyTransaction[]>();

  transactions
    .filter((transaction) => transaction.status === "completed" || transaction.status === "pending")
    .forEach((transaction) => {
      const ageDays = Math.floor((Date.now() - new Date(transaction.createdAt).getTime()) / 86_400_000);
      const key = `${transaction.mechanic.id}:${Math.floor(ageDays / 7)}`;
      groups.set(key, [...(groups.get(key) ?? []), transaction]);
    });

  return Array.from(groups, ([key, items], index) => {
    const week = Number(key.split(":")[1]);
    const hasPending = items.some((item) => item.status === "pending");
    const failed = !hasPending && week > 1 && random.next() < 0.1;
    const status = hasPending ? "pending" : week === 0 ? "processing" : failed ? "failed" : "paid";
    const initiatedAt = daysAgo(week * 7, 9);

    return {
      id: `po_sample_${String(index + 1).padStart(3, "0")}`,
      reference: `PO-${String(55200 + index)}`,
      mechanic: { ...items[0].mechanic },
      amount: roundMoney(items.reduce((sum, item) => sum + item.breakdown.mechanicPayout, 0)),
      currency: SAMPLE_CURRENCY,
      status,
      method: random.next() < 0.7 ? "mobile_money" : "bank_transfer",
      initiatedAt,
      completedAt: status === "paid" ? daysAgo(Math.max(0, week * 7 - 1), 15) : null,
      failureReason: status === "failed" ? "Recipient mobile money account could not be verified." : null,
      transactionIds: items.map((item) => item.id),
    } satisfies SamplePayout;
  }).sort((first, second) => second.initiatedAt.localeCompare(first.initiatedAt));
}

export const SAMPLE_TRANSACTIONS: SampleCompanyTransaction[] = buildTransactions();
export const SAMPLE_PAYOUTS: SamplePayout[] = buildPayouts(SAMPLE_TRANSACTIONS);
