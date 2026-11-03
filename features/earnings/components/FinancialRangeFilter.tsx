import { fieldClassName, fieldLabelClassName } from "@/features/dashboard/components/form-styles";

export type FinancialRange = "7D" | "30D" | "90D" | "custom";

interface FinancialRangeFilterProps {
  idPrefix: string;
  range: FinancialRange;
  fromDate: string;
  toDate: string;
  onRangeChange: (range: FinancialRange) => void;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

export function FinancialRangeFilter({
  idPrefix,
  range,
  fromDate,
  toDate,
  onRangeChange,
  onFromDateChange,
  onToDateChange,
}: FinancialRangeFilterProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-3">
      <legend className="sr-only">Select statistics period</legend>
      <div>
        <label htmlFor={`${idPrefix}-range`} className={fieldLabelClassName}>Statistics period</label>
        <select
          id={`${idPrefix}-range`}
          value={range}
          onChange={(event) => onRangeChange(event.target.value as FinancialRange)}
          className={fieldClassName}
        >
          <option value="7D">Last 7 days</option>
          <option value="30D">Last 30 days</option>
          <option value="90D">Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>
      </div>
      {range === "custom" ? (
        <>
          <div>
            <label htmlFor={`${idPrefix}-from`} className={fieldLabelClassName}>From date</label>
            <input
              id={`${idPrefix}-from`}
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => onFromDateChange(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-to`} className={fieldLabelClassName}>To date</label>
            <input
              id={`${idPrefix}-to`}
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => onToDateChange(event.target.value)}
              className={fieldClassName}
            />
          </div>
        </>
      ) : null}
    </fieldset>
  );
}
