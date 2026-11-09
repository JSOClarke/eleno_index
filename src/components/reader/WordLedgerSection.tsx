import React from "react";
import { Zap } from "lucide-react";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface WordLedgerSectionProps {
  canonicalId: string;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  surface?: string;
  lemma?: string;
  pos?: string;
  sentence?: string;
  definitions?: string[];
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
      <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-[#666666]">
        <span>YOUR VOCABULARY LEDGER</span>
        {isLearning && (
          <span className="flex items-center gap-1 text-[#111111] font-bold">
            <Zap className="w-3 h-3 fill-[#B8FF01]" /> In SRS Deck
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSetStatus(canonicalId, isLearning ? null : "learning")}
          className={`flex items-center justify-center gap-1.5 border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer transition-colors ${
            isLearning ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
          }`}
        >
          {isLearning ? <Zap className="w-3.5 h-3.5 fill-current" /> : null}
          <span>{isLearning ? "Learning · SRS" : "Learn"}</span>
        </button>
        <button
          type="button"
          onClick={() => onSetStatus(canonicalId, isKnown ? null : "known")}
          className={`border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer transition-colors ${
            isKnown ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
          }`}
        >
          {isKnown ? "Known ✓" : "Mark Known"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSetStatus(canonicalId, null)}
        className="w-full py-0.5 text-center font-mono text-[10px] text-[#888888] cursor-pointer hover:text-[#111111]"
      >
        Reset to Unfamiliar / Default
      </button>
    </div>
  );
};
