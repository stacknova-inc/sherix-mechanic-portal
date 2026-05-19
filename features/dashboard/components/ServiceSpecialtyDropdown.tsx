"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { SERVICE_SPECIALTIES } from "@/features/dashboard/constants/employee-options";
import type { ServiceSpecialty } from "@/features/dashboard/types/employee";

interface ServiceSpecialtyDropdownProps {
  selected: ServiceSpecialty[];
  onChange: (specialties: ServiceSpecialty[]) => void;
  disabled?: boolean;
}

export function ServiceSpecialtyDropdown({
  selected,
  onChange,
  disabled = false,
}: ServiceSpecialtyDropdownProps) {
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

  const toggleSpecialty = (specialty: ServiceSpecialty) => {
    if (selected.includes(specialty)) {
      onChange(selected.filter((selectedSpecialty) => selectedSpecialty !== specialty));
      return;
    }

    onChange([...selected, specialty]);
  };

  const removeSpecialty = (specialty: ServiceSpecialty) => {
    onChange(selected.filter((selectedSpecialty) => selectedSpecialty !== specialty));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((currentValue) => !currentValue)}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left hover:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <span className="text-sm text-gray-600">
          {selected.length === 0 ? "Select specialties..." : `${selected.length} selected`}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {SERVICE_SPECIALTIES.map((specialty) => (
              <label
                key={specialty}
                className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(specialty)}
                  onChange={() => toggleSpecialty(specialty)}
                  className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-sm text-gray-700">{specialty}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((specialty) => (
            <div
              key={specialty}
              className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
            >
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty)}
                className="ml-1 hover:text-red-900"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
