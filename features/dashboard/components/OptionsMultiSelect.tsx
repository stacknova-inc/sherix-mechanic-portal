"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface OptionsMultiSelectProps {
  /** id of the visible <label>, used to name the trigger and option list. */
  labelId: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Plural noun for status text, e.g. "services". */
  noun: string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
}

export function OptionsMultiSelect({
  labelId,
  options,
  selectedIds,
  onChange,
  noun,
  isLoading = false,
  isError = false,
  emptyMessage = `No ${noun} available.`,
  disabled = false,
  hasError = false,
  describedBy,
}: OptionsMultiSelectProps) {
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={hasError}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:bg-white/5 dark:hover:border-white/20 dark:disabled:bg-white/10",
          hasError ? "border-red-400" : "border-gray-300 dark:border-white/10",
        )}
      >
        <span className="text-sm text-gray-600 dark:text-white/65">
          {isLoading
            ? `Loading ${noun}...`
            : selectedOptions.length === 0
              ? `Select ${noun}...`
              : `${selectedOptions.length} selected`}
        </span>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <div
          id={listId}
          role="group"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#202329]"
        >
          {isError ? (
            <p className="px-4 py-3 text-sm text-red-600">Unable to load {noun}.</p>
          ) : !isLoading && options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</p>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggle(option.id)}
                  className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-white/70">{option.name}</span>
              </label>
            ))
          )}
        </div>
      ) : null}

      {selectedOptions.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <li
              key={option.id}
              className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
            >
              {option.name}
              <button
                type="button"
                onClick={() => toggle(option.id)}
                disabled={disabled}
                aria-label={`Remove ${option.name}`}
                className="rounded-full hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
