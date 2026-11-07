import React from "react";
import type { SentenceAiExplanation } from "@/types/aiContext.types";

interface SentenceAiExplanationCardProps {
  explanation: SentenceAiExplanation;
  targetWord: string;
}

export const SentenceAiExplanationCard: React.FC<SentenceAiExplanationCardProps> = ({
  explanation,
  targetWord,
}) => {
  return (
    <div className="space-y-2.5 border border-[#111111] bg-[#F8F8F6] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
          AI CONTEXT & TRANSLATION
        </span>
        {explanation.tone_register && (
          <span className="border border-[#111111] bg-[#111111] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[#B8FF01]">
            {explanation.tone_register}
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-[#111111] leading-relaxed">
        “{explanation.natural_translation}”
      </div>

      {explanation.word_nuance && (
        <div className="border-l-2 border-[#111111] pl-2 text-[11px] text-[#333333] leading-normal">
          <span className="font-bold text-[#111111] font-mono text-[10px] uppercase mr-1">
            [{targetWord}]:
          </span>
          {explanation.word_nuance}
        </div>
      )}

      {explanation.grammar_notes.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-[#E2E2DF]">
          <span className="font-mono text-[9px] font-bold uppercase text-[#888888]">
            GRAMMAR & SYNTAX
          </span>
          <ul className="space-y-1 font-mono text-[10px] text-[#444444] list-disc list-inside">
            {explanation.grammar_notes.map((note, idx) => (
              <li key={idx} className="leading-tight">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
