import type { CommissionBreakdown as ApiBreakdown, LegacyCommissionBreakdown } from "@/features/earnings/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/utils/cn";

interface CommissionBreakdownProps {
  breakdown: ApiBreakdown | LegacyCommissionBreakdown;
  currency?: string;
}

export function CommissionBreakdown({ breakdown, currency }: CommissionBreakdownProps) {
  const rows: Array<{ label: string; value: string; emphasis?: boolean; deduction?: boolean }> = "headline" in breakdown
    ? [
        { label: "Customer payment (gross)", value: breakdown.formattedCustomerPaymentGross, emphasis: true },
        { label: "Customer fee", value: breakdown.customerFeeLabel, deduction: true },
        {
          label: `Sherix platform commission (${breakdown.platformCommissionPercent}%)`,
          value: breakdown.platformCommissionLabel,
          deduction: true,
        },
        { label: "Sherix platform payout", value: breakdown.platformPayout },
        { label: "Payment processing fee", value: breakdown.paymentProcessingFeeLabel, deduction: true },
        { label: "Net amount to split", value: breakdown.formattedNetAmountToSplit, emphasis: true },
        { label: "Mechanic share", value: breakdown.formattedMechanicShare },
        { label: "Company share", value: breakdown.formattedCompanyShare },
      ]
    : [
        { label: "Customer payment (gross)", value: formatMoney(breakdown.grossAmount, currency), emphasis: true },
        {
          label: `Sherix platform commission (${new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 2 }).format(breakdown.platformCommissionRate)})`,
          value: formatMoney(-breakdown.platformCommission, currency),
          deduction: true,
        },
        { label: "Payment processing fee", value: formatMoney(-breakdown.processingFee, currency), deduction: true },
        { label: "Net amount to split", value: formatMoney(breakdown.netAmount, currency), emphasis: true },
        { label: "Mechanic payout", value: formatMoney(breakdown.mechanicPayout, currency) },
        { label: "Company share", value: formatMoney(breakdown.companyShare, currency) },
      ];

  return (
    <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-4 border-b border-dashed border-[#e5e8ee] py-1.5 dark:border-white/10"
        >
          <dt className="text-[#596170] dark:text-white/60">{row.label}</dt>
          <dd
            className={cn(
              "whitespace-nowrap text-right",
              row.emphasis ? "font-extrabold text-brand-dark dark:text-white" : "font-semibold",
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
