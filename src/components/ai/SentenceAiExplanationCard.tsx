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
      <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-1">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
          AI CONTEXT
        </span>
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

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          {explanation.pattern ? (
            <>
              <span className="border border-[#111111] bg-[#B8FF01] px-1 py-0.2 text-[8px] font-bold uppercase text-[#111111]">
                PATTERN
              </span>
              <span className="font-bold text-[#111111]">{explanation.pattern}</span>
              <span className="text-[#888888]">→</span>
            </>
          ) : (
            <span className="shrink-0 bg-[#111111] text-white px-1 py-0.5 font-bold uppercase text-[8px]">
              CHUNK
            </span>
          )}
          <span className="font-medium italic text-[#333333]">
            "{explanation.chunk || targetWord}"
          </span>
        </div>

        <div className="border-l-2 border-[#111111] pl-2 text-[11px] text-[#222222] leading-snug">
          {explanation.meaning}
        </div>
      </div>

      {explanation.translation && (
        <div className="border-t border-[#E2E2DF] pt-1.5 font-serif text-[11px] italic text-[#555555] leading-snug">
          “{explanation.translation}”
        </div>
      )}
    </div>
  );
};
