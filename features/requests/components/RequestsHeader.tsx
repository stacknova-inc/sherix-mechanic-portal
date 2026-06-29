"use client";

import {
  Search,
} from "lucide-react";

interface RequestsHeaderProps {
  searchValue: string;
  filterValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export function RequestsHeader({
  searchValue,
  filterValue,
  onSearchChange,
  onFilterChange,
}: RequestsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center mt-6 mb-12">
      <div className="mr-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark md:text-[34px] dark:text-white">
          Requests
        </h1>
        <p className="mt-1 text-sm font-medium text-[#6f7784] dark:text-white/55">
          Review, route, and resolve employee requests from one workspace.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-xl border border-[#eef0f3] bg-white pl-10 pr-4 text-sm font-semibold outline-none transition placeholder:text-[#9aa1ad] focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-[#1b1d22] dark:text-white dark:focus:ring-red-950/30"
          />
        </label>

      

       
       
      </div>
    </div>
  );
}
