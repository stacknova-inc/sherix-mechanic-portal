"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import { useServices } from "@/features/dashboard/hooks/useServices";
import type { ServiceOption } from "@/types/service";
import { cn } from "@/utils/cn";

interface ServicesMultiSelectProps {
  selectedServiceIds: string[];
  onChange: (serviceIds: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function ServicesMultiSelect({
  selectedServiceIds,
  onChange,
  disabled = false,
  hasError = false,
}: ServicesMultiSelectProps) {
  const { data: services = [], isError, isLoading } = useServices();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedServices = services.filter((service: ServiceOption) =>
    selectedServiceIds.includes(service.id),
  );

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      onChange(selectedServiceIds.filter((selectedId) => selectedId !== serviceId));
      return;
    }

    onChange([...selectedServiceIds, serviceId]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((currentValue) => !currentValue)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left hover:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100",
          hasError ? "border-red-400" : "border-gray-300",
        )}
      >
        <span className="text-sm text-gray-600">
          {isLoading
            ? "Loading services..."
            : selectedServices.length === 0
              ? "Select services..."
              : `${selectedServices.length} selected`}
        </span>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        ) : (
          <ChevronDown
            size={16}
            className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")}
          />
        )}
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">
            {isError ? (
              <p className="px-4 py-3 text-sm text-red-600">
                Unable to load services.
              </p>
            ) : null}

            {!isError && !isLoading && services.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                No services available.
              </p>
            ) : null}

            {services.map((service: ServiceOption) => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-sm text-gray-700">{service.name}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {selectedServices.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedServices.map((service: ServiceOption) => (
            <span
              key={service.id}
              className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
            >
              {service.name}
              <button
                type="button"
                onClick={() =>
                  onChange(
                    selectedServiceIds.filter(
                      (selectedId) => selectedId !== service.id,
                    ),
                  )
                }
                className="hover:text-red-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
