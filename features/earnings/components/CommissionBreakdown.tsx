import type { CommissionBreakdown as Breakdown } from "@/features/earnings/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/utils/cn";

const percent = (value: number) =>
  new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);

interface CommissionBreakdownProps {
  breakdown: Breakdown;
  currency: string;
}

export function CommissionBreakdown({
  breakdown,
  currency,
}: CommissionBreakdownProps) {
  const money = (amount: number) => formatMoney(amount, currency);


  const rows: Array<{
    label: string;
    value: string;
    emphasis?: boolean;
    deduction?: boolean;
  }> = [
    {
      label: "Customer payment (gross)",
      value: money(breakdown.grossAmount),
      emphasis: true,
    },
    {
      label: `Customer Fee (${percent(breakdown.customerFeeRate)})`,
      value: money(breakdown.customerFee),
      deduction: true,
    },
    {
      label: `Sherix platform commission (${percent(
        breakdown.platformCommissionRate,
      )})`,
      value: money(-breakdown.platformCommission),
      deduction: true,
    },
    {
      label: `Sherix platform total payout`,
      value: money(
        breakdown.customerFee + breakdown.platformCommission,
      ),
      deduction: true,
    },
    {
      label: "Payment processing fee",
      value: money(-breakdown.processingFee),
      deduction: true,
    },
    {
      label: "Net amount to split",
      value: money(breakdown.netAmount),
      emphasis: true,
    },
  ];

  return (
    <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-4 border-b border-dashed border-[#e5e8ee] py-1.5 dark:border-white/10"
        >
          <dt className="text-[#596170] dark:text-white/60">
            {row.label}
          </dt>

          <dd
            className={cn(
              "whitespace-nowrap text-right",
              row.emphasis
                ? "font-extrabold text-brand-dark dark:text-white"
                : "font-semibold",
              row.deduction && "text-[#be123c] dark:text-red-300",
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}