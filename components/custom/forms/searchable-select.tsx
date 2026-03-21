"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SelectOption } from "@/components/custom/forms/invoice-form-shared";

type SearchableSelectProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  compact?: boolean;
};

export function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  compact = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setQuery("");
        }}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <span
          className={selected ? "text-foreground" : "text-muted-foreground"}
        >
          {selected?.label || placeholder}
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-white p-2 shadow-lg">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
          />

          <div className="max-h-48 overflow-y-auto">
            {!filteredOptions.length && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No results found.
              </p>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
