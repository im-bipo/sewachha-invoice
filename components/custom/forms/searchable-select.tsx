"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function updateMenuPosition() {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    function handlePositionUpdate() {
      updateMenuPosition();
    }

    window.addEventListener("resize", handlePositionUpdate);
    window.addEventListener("scroll", handlePositionUpdate, true);

    return () => {
      window.removeEventListener("resize", handlePositionUpdate);
      window.removeEventListener("scroll", handlePositionUpdate, true);
    };
  }, [isOpen]);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next) {
              updateMenuPosition();
            }
            return next;
          });
          setQuery("");
        }}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <span
          className={
            selected ? "text-foreground line-clamp-1 " : "text-muted-foreground"
          }
        >
          {selected?.label || placeholder}
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </button>

      {typeof document !== "undefined" &&
        isOpen &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 rounded-lg border border-border bg-white p-2 shadow-lg"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
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
          </div>,
          document.body,
        )}
    </div>
  );
}
