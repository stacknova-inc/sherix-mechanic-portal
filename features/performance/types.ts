export interface MechanicQualityMetrics {
  mechanicId: string;
  mechanicName: string;
  /** 0–1: accepted / offered Service Requests. */
  acceptanceRate: number;
  /** Average minutes from assignment to acceptance. */
  avgResponseMinutes: number;
  /** 1–5, null when the mechanic has no ratings in the period. */
  averageRating: number | null;
  ratingCount: number;
  /** Mechanic payouts in the period. */
  earnings: number;
  disputeCount: number;
}

export interface PerformanceTrendPoint {
  /** Bucket start, YYYY-MM-DD. */
  date: string;
  earnings: number;
  /** null when no ratings were received in the bucket. */
  averageRating: number | null;
}

export interface PerformanceInsights {
  currency: string;
  period: { from: string; to: string };
  bucket: "day" | "week";
  totals: Omit<MechanicQualityMetrics, "mechanicId" | "mechanicName">;
  mechanics: MechanicQualityMetrics[];
  trend: PerformanceTrendPoint[];
}

export interface PerformanceInsightsParams {
  from: string;
  to: string;
  /** "" = all mechanics. */
  mechanicId: string;
}
