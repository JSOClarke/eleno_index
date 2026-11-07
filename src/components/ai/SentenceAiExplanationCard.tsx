import React from "react";
import type { SentenceAiExplanation } from "@/types/aiContext.types";

interface SentenceAiExplanationCardProps {
  explanation: SentenceAiExplanation;
  targetWord: string;
  onHide?: () => void;
}

export const SentenceAiExplanationCard: React.FC<SentenceAiExplanationCardProps> = ({
  explanation,
  targetWord,
  onHide,
}) => {
  return (
    <div className="space-y-2 border border-[#111111] bg-[#F8F8F6] p-2 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-[#E2E2DF] pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
            AI CONTEXT
          </span>
          {explanation.tone_register && (
            <span className="border border-[#111111] bg-[#111111] px-1 py-0.2 font-mono text-[8px] font-bold uppercase text-[#B8FF01]">
              {explanation.tone_register}
            </span>
          )}
        </div>
        {onHide && (
          <button
            type="button"
            onClick={onHide}
            className="font-mono text-[9px] font-bold text-[#888888] hover:text-[#111111] underline cursor-pointer"
          >
            HIDE
          </button>
        )}
      </div>

      <div className="text-[11px] font-medium text-[#111111] leading-snug">
        "{explanation.natural_translation}"
      </div>

      {explanation.word_nuance && (
        <div className="border-l-2 border-[#111111] pl-1.5 text-[10px] text-[#333333] leading-tight">
          <span className="font-bold text-[#111111] font-mono uppercase mr-1">
            [{targetWord}]:
          </span>
          {explanation.word_nuance}
        </div>
      )}

      {explanation.grammar_notes.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-[#E2E2DF]">
          <span className="font-mono text-[8px] font-bold uppercase text-[#888888]">
            SYNTAX NOTES
          </span>
          <ul className="space-y-0.5 font-mono text-[9px] text-[#444444] list-disc list-inside">
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
