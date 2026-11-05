import React from "react";
import { useSpanishDefinition } from "@/hooks/useSpanishDefinition";
import type { DefinitionLanguage, TrackedLexiconEntry } from "@/types/reader.types";

interface WordDefinitionsPanelProps {
  entry: TrackedLexiconEntry;
  language: DefinitionLanguage;
  onLanguageChange: (language: DefinitionLanguage) => void;
}

export const WordDefinitionsPanel: React.FC<WordDefinitionsPanelProps> = ({
  entry,
  language,
  onLanguageChange,
}) => {
  const { definition, loading, error } = useSpanishDefinition(
    language === "es" ? entry.id : null
  );

  const definitions =
    language === "en" ? entry.definitions : definition?.definitions || [];
  const sourceLabel =
    language === "en" ? "KAIKKI · es → en" : "WIKCIONARIO · es → es";
  const emptyLabel =
    language === "en"
      ? "No English definition available."
      : "No Spanish definition available.";

  return (
    <div className="border-t border-[#E2E2DF] pt-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex border border-[#111111]">
          {(["en", "es"] as DefinitionLanguage[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onLanguageChange(code)}
              className={`px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                language === code
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#666666]"
              }`}
            >
              {code === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#888888]">
          {sourceLabel}
        </span>
      </div>

      {language === "es" && loading && (
        <p className="font-mono text-[11px] text-[#888888]">Loading Spanish definition…</p>
      )}
      {language === "es" && error && (
        <p className="font-mono text-[11px] text-red-600">Could not load Spanish definition.</p>
      )}
      {!loading && !error && (
        <ol className="max-h-32 space-y-1.5 overflow-y-auto pr-1 font-sans text-xs leading-relaxed text-[#222222]">
          {definitions.length > 0 ? (
            definitions.slice(0, 4).map((text, index) => (
              <li key={`${language}-${index}`} className="flex gap-1.5">
                <span className="font-mono font-bold text-[#666666]">{index + 1}.</span>
                <span>{text}</span>
              </li>
            ))
          ) : (
            <p className="italic text-[#888888]">{emptyLabel}</p>
          )}
        </ol>
      )}
    </div>
  );
};
