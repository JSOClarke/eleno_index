import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { fetchKnownCountsByLanguage } from "@/api/vocabulary.api";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import { formatNumber } from "@/lib/formatters";

export const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "zh", label: "Chinese" },
  { code: "ru", label: "Russian" },
];

export const FlagIcon: React.FC<{ code: SupportedLanguage }> = ({ code }) =>
  code === "es" ? (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="24" height="4.5" fill="#C60B1E" />
      <rect y="4.5" width="24" height="9" fill="#FFC400" />
      <rect y="13.5" width="24" height="4.5" fill="#C60B1E" />
    </svg>
  ) : code === "zh" ? (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="24" height="18" fill="#DE2910" />
      <polygon points="5,2.5 5.9,5.1 8.6,5.1 6.4,6.7 7.2,9.3 5,7.7 2.8,9.3 3.6,6.7 1.4,5.1 4.1,5.1" fill="#FFDE00" />
    </svg>
  ) : code === "ru" ? (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="24" height="6" fill="#FFFFFF" />
      <rect y="6" width="24" height="6" fill="#0039A6" />
      <rect y="12" width="24" height="6" fill="#D52B1E" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 18" className="h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10" aria-hidden="true">
      <rect width="8" height="18" fill="#002395" />
      <rect x="8" width="8" height="18" fill="#FFFFFF" />
      <rect x="16" width="8" height="18" fill="#ED2939" />
    </svg>
  );

interface ProfileLanguageSectionProps {
  activeLanguage: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  activeKnownCount?: number;
  knownCounts?: Record<SupportedLanguage, number>;
  userId?: string | null;
  onSelect?: () => void;
}

/** Compact target-language switcher embedded inside UserAvatarMenu and MobileNavDrawer. */
export const ProfileLanguageSection: React.FC<ProfileLanguageSectionProps> = ({
  activeLanguage,
  onChangeLanguage,
  activeKnownCount = 0,
  knownCounts,
  userId,
  onSelect,
}) => {
  const [fetchedCounts, setFetchedCounts] = useState<Record<SupportedLanguage, number>>({ es: 0, fr: 0, zh: 0, ru: 0 });

  useEffect(() => {
    if (knownCounts) return;
    if (!userId) {
      setFetchedCounts({ es: 0, fr: 0, zh: 0, ru: 0 });
      return;
    }
    let cancelled = false;
    fetchKnownCountsByLanguage(userId)
      .then((res) => { if (!cancelled) setFetchedCounts(res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId, knownCounts]);

  const counts = knownCounts || fetchedCounts;
  const countFor = (lang: SupportedLanguage) =>
    lang === activeLanguage ? Math.max(activeKnownCount, counts[lang]) : counts[lang];

  return (
    <div className="border-t border-slate-100 pt-2 px-1 space-y-1">
      <div className="text-[11px] font-medium text-slate-400">Target language</div>
      <div role="radiogroup" aria-label="Select target language" className="space-y-0.5">
        {LANGUAGES.map((opt) => {
          const isSelected = opt.code === activeLanguage;
          return (
            <button
              key={opt.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                onChangeLanguage?.(opt.code);
                onSelect?.();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                isSelected ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
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
    </div>
  );
};
