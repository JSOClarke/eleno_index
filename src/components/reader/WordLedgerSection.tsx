import React from "react";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface WordLedgerSectionProps {
  canonicalId: string;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const WordLedgerSection: React.FC<WordLedgerSectionProps> = ({
  canonicalId,
  status,
  onSetStatus,
}) => {
  const isLearning = status === "learning";
  const isKnown = status === "known";

  return (
    <div className="space-y-2 border-t-2 border-[#111111] pt-3">
      <div className="font-mono text-[10px] font-bold uppercase text-[#666666]">
        YOUR VOCABULARY LEDGER
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSetStatus(canonicalId, isLearning ? null : "learning")}
          className={`border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer ${
            isLearning ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111]"
          }`}
        >
          {isLearning ? "✓ Still Learning" : "Learn"}
        </button>
        <button
          type="button"
          onClick={() => onSetStatus(canonicalId, isKnown ? null : "known")}
          className={`border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer ${
            isKnown ? "bg-[#111111] text-white" : "bg-white text-[#111111]"
          }`}
        >
          {isKnown ? "Known ✓" : "Mark Known"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSetStatus(canonicalId, null)}
        className="w-full py-0.5 text-center font-mono text-[10px] text-[#888888] cursor-pointer"
      >
        Reset to Unfamiliar / Default
      </button>
    </div>
  );
};
