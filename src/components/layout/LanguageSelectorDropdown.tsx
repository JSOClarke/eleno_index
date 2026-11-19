import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { fetchKnownCountsByLanguage } from "@/api/vocabulary.api";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import { formatNumber } from "@/lib/formatters";

interface LanguageSelectorDropdownProps {
  activeLanguage: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  activeKnownCount: number;
  userId?: string | null;
  inverted?: boolean;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
];

const FlagIcon: React.FC<{ code: SupportedLanguage }> = ({ code }) =>
  code === "es" ? (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="24" height="4.5" fill="#C60B1E" />
      <rect y="4.5" width="24" height="9" fill="#FFC400" />
      <rect y="13.5" width="24" height="4.5" fill="#C60B1E" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="8" height="18" fill="#002395" />
      <rect x="8" width="8" height="18" fill="#FFFFFF" />
      <rect x="16" width="8" height="18" fill="#ED2939" />
    </svg>
  );

export const LanguageSelectorDropdown: React.FC<LanguageSelectorDropdownProps> = ({
  activeLanguage,
  onChangeLanguage,
  activeKnownCount,
  userId,
  inverted = false,
}) => {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<SupportedLanguage, number>>({ es: 0, fr: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setCounts({ es: 0, fr: 0 });
      return;
    }
    let cancelled = false;
    fetchKnownCountsByLanguage(userId)
      .then((res) => {
        if (!cancelled) setCounts(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

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

  const countFor = (lang: SupportedLanguage) =>
    lang === activeLanguage ? activeKnownCount : counts[lang];
  const activeOption = LANGUAGES.find((l) => l.code === activeLanguage) || LANGUAGES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Target language: ${activeOption.label}`}
        title={activeOption.label}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
          inverted
            ? "border-white bg-white text-slate-950 hover:bg-slate-200 shadow-xs"
            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <FlagIcon code={activeOption.code} />
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select target language"
          className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-40 space-y-0.5"
        >
          {LANGUAGES.map((opt) => {
            const isSelected = opt.code === activeLanguage;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChangeLanguage?.(opt.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                  isSelected ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FlagIcon code={opt.code} />
                  <span>{opt.label}</span>
                </span>
                <span className={`flex items-center gap-1.5 text-[11px] tabular-nums ${isSelected ? "text-white/75" : "text-slate-500"}`}>
                  {userId ? `${formatNumber(countFor(opt.code))} known` : ""}
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
