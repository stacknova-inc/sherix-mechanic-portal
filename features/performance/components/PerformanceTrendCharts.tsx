"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformanceTrendPoint } from "@/features/performance/types";
import { formatRating } from "@/features/performance/utils/quality-metrics";
import { formatMoney } from "@/lib/money";

interface PerformanceTrendChartsProps {
  trend: PerformanceTrendPoint[];
  currency: string;
  bucket: "day" | "week";
  periodLabel: string;
}

const AXIS_COLOR = "#8f96a3";
const GRID_COLOR = "rgba(143, 150, 163, 0.2)";
const BRAND_RED = "#e4072f";

function shortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function ChartFigure({
  title,
  description,
  children,
  fallback,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <figure className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10">
      <figcaption>
        <span className="block text-sm font-extrabold text-brand-dark dark:text-white">{title}</span>
        <span className="block text-xs font-semibold text-[#8f96a3]">{description}</span>
      </figcaption>
      {/* The chart is visual only; screen readers get the equivalent table below. */}
      <div className="mt-4 h-56" aria-hidden="true">
        {children}
      </div>
      <div className="sr-only">{fallback}</div>
    </figure>
  );
}

export function PerformanceTrendCharts({ trend, currency, bucket, periodLabel }: PerformanceTrendChartsProps) {
  const bucketLabel = bucket === "day" ? "Daily" : "Weekly";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFigure
        title={`Mechanic earnings — ${periodLabel}`}
        description={`${bucketLabel} totals in ${currency}`}
        fallback={
          <table>
            <caption>{`${bucketLabel} mechanic earnings`}</caption>
            <tbody>
              {trend.map((point) => (
                <tr key={point.date}>
                  <th scope="row">{shortDate(point.date)}</th>
                  <td>{formatMoney(point.earnings, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND_RED} stopOpacity={0.25} />
                <stop offset="100%" stopColor={BRAND_RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={56} tickFormatter={(value: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(value)} />
            <Tooltip
              formatter={(value) => [formatMoney(value, currency), "Earnings"]}
              labelFormatter={(label) => shortDate(String(label))}
            />
            <Area type="monotone" dataKey="earnings" stroke={BRAND_RED} strokeWidth={2} fill="url(#earnings-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFigure>

      <ChartFigure
        title={`Average rating — ${periodLabel}`}
        description={`${bucketLabel} average customer rating (1–5). Gaps mean no ratings that ${bucket}.`}
        fallback={
          <table>
            <caption>{`${bucketLabel} average rating`}</caption>
            <tbody>
              {trend.map((point) => (
                <tr key={point.date}>
                  <th scope="row">{shortDate(point.date)}</th>
                  <td>{formatRating(point.averageRating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: AXIS_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              formatter={(value) => [formatRating(typeof value === "number" ? value : null), "Rating"]}
              labelFormatter={(label) => shortDate(String(label))}
            />
            <Line type="monotone" dataKey="averageRating" stroke="#17191f" strokeWidth={2} dot={false} connectNulls={false} className="dark:[&_path]:stroke-white" />
          </LineChart>
        </ResponsiveContainer>
      </ChartFigure>
    </div>
  );
}
