import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface FilterDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectDropdownProps<T extends string> {
  prefix: string;
  value: T;
  options: ReadonlyArray<FilterDropdownOption<T>>;
  onChange: (value: T) => void;
  ariaLabel?: string;
  icon?: React.ReactNode;
  align?: "left" | "right";
  menuWidthClass?: string;
}

export function FilterSelectDropdown<T extends string>({
  prefix,
  value,
  options,
  onChange,
  ariaLabel,
  icon,
  align = "right",
  menuWidthClass = "min-w-[9.5rem]",
}: FilterSelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel || prefix}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:bg-white cursor-pointer"
      >
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          {icon}
          <span>{prefix}:</span>
        </span>
        <span className="max-w-[12rem] truncate font-semibold text-slate-900">{active?.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel || prefix}
          className={`absolute ${align === "left" ? "left-0" : "right-0"} mt-1.5 ${menuWidthClass} rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg z-30`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-left text-xs transition cursor-pointer ${
                  isSelected ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
