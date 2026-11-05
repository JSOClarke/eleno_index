import React from "react";
import type { ElenoPhraseHint } from "@/types/reader.types";

interface WordPhrasesSectionProps {
  phrases: ElenoPhraseHint[];
}

export const WordPhrasesSection: React.FC<WordPhrasesSectionProps> = ({
  phrases,
}) => {
  if (!phrases.length) return null;

  return (
    <div className="border-t border-[#E2E2DF] pt-2.5">
      <div className="mb-2 font-mono text-[10px] font-bold uppercase text-[#666666]">
        Phrases in this sentence
      </div>
      <ul className="max-h-28 space-y-1.5 overflow-y-auto pr-1">
        {phrases.slice(0, 6).map((phrase) => (
          <li key={phrase.id} className="border-l-2 border-[#B8FF01] pl-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-sans text-xs font-bold text-[#111111]">
                {phrase.phrase}
              </span>
              <span className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-wider text-[#888888]">
                {phrase.type.replace("_", " ")}
              </span>
            </div>
            {phrase.gloss && (
              <p className="font-sans text-[11px] leading-snug text-[#555555]">
                {phrase.gloss}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
