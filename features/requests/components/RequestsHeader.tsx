"use client";

import { Search, X } from "lucide-react";
import type { ServiceRequestFilters } from "@/features/requests/types";
import type { FilterOption } from "@/features/requests/utils/service-request-filters";

interface RequestsHeaderProps {
  searchValue: string;
  filters: ServiceRequestFilters;
  statusOptions: FilterOption[];
  mechanicOptions: FilterOption[];
  paymentStatusOptions: FilterOption[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (next: Partial<ServiceRequestFilters>) => void;
  onClearFilters: () => void;
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-[#eef0f3] bg-white px-3 text-sm font-semibold text-brand-dark outline-none transition focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-[#1b1d22] dark:text-white dark:focus:ring-red-950/30";
const labelClassName = "mb-1.5 block text-[11px] font-extrabold uppercase text-[#8a929e]";

function FilterSelect({
  id,
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      >
        <option value="">{allLabel}</option>
        {/* Keep a URL-provided value selectable even when no loaded record carries it. */}
        {value && !options.some((option) => option.value === value) ? (
          <option value={value}>{value.replace(/^name:/, "")}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RequestsHeader({
  searchValue,
  filters,
  statusOptions,
  mechanicOptions,
  paymentStatusOptions,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onClearFilters,
}: RequestsHeaderProps) {
  return (
    <div className="mb-8 mt-6 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="mr-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white md:text-[34px]">
            Service Requests
          </h1>
          <p className="mt-1 text-sm font-medium text-[#6f7784] dark:text-white/55">
            Search the full history of Service Requests assigned to your company.
          </p>
        </div>

        <div className="w-full xl:w-[320px]">
          <label htmlFor="service-request-search" className="sr-only">
            Search Service Requests
          </label>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]"
              aria-hidden="true"
            />
            <input
              id="service-request-search"
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by ID, customer, mechanic, or service"
              className={`${fieldClassName} pl-10`}
            />
          </div>
        </div>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <legend className="sr-only">Filter Service Requests</legend>
        <FilterSelect
          id="service-request-status"
          label="Status"
          value={filters.status}
          options={statusOptions}
          allLabel="All statuses"
          onChange={(status) => onFilterChange({ status })}
        />
        <FilterSelect
          id="service-request-mechanic"
          label="Mechanic"
          value={filters.mechanic}
          options={mechanicOptions}
          allLabel="All mechanics"
          onChange={(mechanic) => onFilterChange({ mechanic })}
        />
        <FilterSelect
          id="service-request-payment"
          label="Payment status"
          value={filters.paymentStatus}
          options={paymentStatusOptions}
          allLabel="All payment statuses"
          onChange={(paymentStatus) => onFilterChange({ paymentStatus })}
        />
        <div>
          <label htmlFor="service-request-from" className={labelClassName}>
            From date
          </label>
          <input
            id="service-request-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onFilterChange({ from: event.target.value })}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="service-request-to" className={labelClassName}>
            To date
          </label>
          <input
            id="service-request-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onFilterChange({ to: event.target.value })}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="service-request-sort" className={labelClassName}>
            Sort
          </label>
          <select
            id="service-request-sort"
            value={filters.sort}
            onChange={(event) =>
              onFilterChange({ sort: event.target.value === "oldest" ? "oldest" : "newest" })
            }
            className={fieldClassName}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </fieldset>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#eef0f3] bg-white px-4 text-xs font-extrabold text-[#4b535f] transition hover:border-brand-red hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear search and filters
        </button>
      ) : null}
    </div>
  );
}
