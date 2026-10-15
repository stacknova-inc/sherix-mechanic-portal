import type {
  MechanicQualityMetrics,
  PerformanceInsights,
  PerformanceInsightsParams,
  PerformanceTrendPoint,
} from "@/features/performance/types";
import { toDateInputValue } from "@/features/requests/utils/service-request-filters";
import { mockRequest } from "@/mocks/mock-request";
import { SAMPLE_CURRENCY, SAMPLE_MECHANICS, createRandom, roundMoney } from "@/mocks/sample-data";

const DAY_MS = 86_400_000;
/** "All time" in the sample world covers six months. */
const ALL_TIME_DAYS = 182;

function periodDays(params: PerformanceInsightsParams) {
  if (!params.from || !params.to) {
    return ALL_TIME_DAYS;
  }

  const days = Math.round((new Date(params.to).getTime() - new Date(params.from).getTime()) / DAY_MS) + 1;
  return Math.max(1, days);
}

function buildMechanicMetrics(days: number): MechanicQualityMetrics[] {
  return SAMPLE_MECHANICS.map((mechanic, index) => {
    const random = createRandom(7001 + index * 31);
    const ratingCount = Math.round((days / 30) * random.int(4, 14));

    return {
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      acceptanceRate: Math.round(random.amount(0.62, 0.98) * 1000) / 1000,
      avgResponseMinutes: Math.round(random.amount(3, 26) * 10) / 10,
      averageRating: ratingCount > 0 ? Math.round(random.amount(3.6, 4.95) * 100) / 100 : null,
      ratingCount,
      earnings: roundMoney((days / 30) * random.amount(1800, 7200)),
      disputeCount: random.next() < 0.55 ? 0 : Math.max(0, Math.round((days / 30) * random.int(0, 2))),
    };
  });
}

function weightedAverage(rows: MechanicQualityMetrics[], pick: (row: MechanicQualityMetrics) => number | null, weight: (row: MechanicQualityMetrics) => number) {
  let total = 0;
  let weights = 0;

  rows.forEach((row) => {
    const value = pick(row);
    const rowWeight = weight(row);
    if (value !== null && rowWeight > 0) {
      total += value * rowWeight;
      weights += rowWeight;
    }
  });

  return weights > 0 ? total / weights : null;
}

function buildTrend(days: number, mechanics: MechanicQualityMetrics[]): { bucket: "day" | "week"; points: PerformanceTrendPoint[] } {
  const bucket = days <= 31 ? "day" : "week";
  const bucketDays = bucket === "day" ? 1 : 7;
  const count = Math.ceil(days / bucketDays);
  const totalEarnings = mechanics.reduce((sum, row) => sum + row.earnings, 0);
  const baseRating = weightedAverage(mechanics, (row) => row.averageRating, (row) => row.ratingCount) ?? 4.4;
  const random = createRandom(55 + days + mechanics.length);
  const weights = Array.from({ length: count }, () => random.amount(0.6, 1.4));
  const weightSum = weights.reduce((sum, value) => sum + value, 0);

  const points = weights.map((weight, index) => {
    const start = new Date(Date.now() - (days - 1 - index * bucketDays) * DAY_MS);
    const noRatings = mechanics.length === 0 || random.next() < 0.08;

    return {
      date: toDateInputValue(start),
      earnings: roundMoney((totalEarnings * weight) / weightSum),
      averageRating: noRatings ? null : Math.min(5, Math.max(1, Math.round((baseRating + random.amount(-0.35, 0.3)) * 100) / 100)),
    };
  });

  return { bucket, points };
}

/**
 * TODO: connect to backend — expected endpoint: GET /company/performance/insights
 * Query: from?: YYYY-MM-DD, to?: YYYY-MM-DD, mechanicId?: string
 * Response: {
 *   currency: "GHS", period: { from, to }, bucket: "day" | "week",
 *   totals:    { acceptanceRate, avgResponseMinutes, averageRating | null, ratingCount, earnings, disputeCount },
 *   mechanics: [{ mechanicId, mechanicName, acceptanceRate (0–1), avgResponseMinutes,
 *                 averageRating (1–5) | null, ratingCount, earnings, disputeCount }],
 *   trend:     [{ date: YYYY-MM-DD (bucket start), earnings, averageRating | null }]
 * }
 * Definitions to confirm: acceptance = accepted ÷ offered; response time = assignment → acceptance;
 * earnings = mechanic payouts in the period; disputes = disputes opened in the period.
 */
export async function getPerformanceInsights(params: PerformanceInsightsParams): Promise<PerformanceInsights> {
  return mockRequest("performance", () => {
    const days = periodDays(params);
    const mechanics = buildMechanicMetrics(days).filter(
      (row) => !params.mechanicId || row.mechanicId === params.mechanicId,
    );
    const { bucket, points } = buildTrend(days, mechanics);

    return {
      currency: SAMPLE_CURRENCY,
      period: { from: params.from, to: params.to },
      bucket,
      totals: {
        acceptanceRate: weightedAverage(mechanics, (row) => row.acceptanceRate, () => 1) ?? 0,
        avgResponseMinutes: Math.round((weightedAverage(mechanics, (row) => row.avgResponseMinutes, () => 1) ?? 0) * 10) / 10,
        averageRating: (() => {
          const rating = weightedAverage(mechanics, (row) => row.averageRating, (row) => row.ratingCount);
          return rating === null ? null : Math.round(rating * 100) / 100;
        })(),
        ratingCount: mechanics.reduce((sum, row) => sum + row.ratingCount, 0),
        earnings: roundMoney(mechanics.reduce((sum, row) => sum + row.earnings, 0)),
        disputeCount: mechanics.reduce((sum, row) => sum + row.disputeCount, 0),
      },
      mechanics,
      trend: points,
    };
  });
}
