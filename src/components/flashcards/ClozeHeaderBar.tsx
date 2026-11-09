import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import type { CardDisplayMode, ReviewSessionMode } from "@/types/flashcard.types";

interface ClozeHeaderBarProps {
  currentIndex: number;
  totalCards: number;
  streak: number;
  sessionMode: ReviewSessionMode;
  onChangeSessionMode: (mode: ReviewSessionMode) => void;
  activeCardMode: CardDisplayMode;
  lenientAccents: boolean;
  onToggleLenient: () => void;
}

export const ClozeHeaderBar: React.FC<ClozeHeaderBarProps> = ({
  currentIndex,
  totalCards,
  streak,
  sessionMode,
  onChangeSessionMode,
  activeCardMode,
  lenientAccents,
  onToggleLenient,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DF] pb-3 mb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-1.5 border border-[#111111] bg-white hover:bg-[#F4F4F2] cursor-pointer"
          title="Exit review"
        >
          <ArrowLeft className="w-4 h-4 text-[#111111]" />
        </Link>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
          CARD {currentIndex + 1} OF {totalCards}
        </span>
        <span
          className={`border border-[#111111] px-2 py-0.5 font-mono text-[11px] font-bold ${
            activeCardMode === "recognition"
              ? "bg-[#B8FF01] text-[#111111]"
              : "bg-[#111111] text-white"
          }`}
        >
          {activeCardMode === "recognition" ? "👁 RECOGNITION" : "✍ CLOZE"}
        </span>
        {streak > 1 && (
          <span className="hidden md:inline bg-[#F8F8F6] text-[#111111] px-2 py-0.5 font-mono text-xs font-bold border border-[#111111]">
            🔥 {streak}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex border border-[#111111] font-mono text-xs bg-white">
          <button
            type="button"
            onClick={() => onChangeSessionMode("auto")}
            className={`px-2 py-1 cursor-pointer ${
              sessionMode === "auto" ? "bg-[#111111] text-[#B8FF01] font-bold" : "text-[#666666] hover:text-[#111111]"
            }`}
            title="Level 1 = Recognition, Levels 2+ = Cloze Production"
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => onChangeSessionMode("recognition")}
            className={`px-2 py-1 border-l border-[#111111] cursor-pointer ${
              sessionMode === "recognition" ? "bg-[#111111] text-[#B8FF01] font-bold" : "text-[#666666] hover:text-[#111111]"
            }`}
            title="Read and self-assess meaning"
          >
            Recog
          </button>
          <button
            type="button"
            onClick={() => onChangeSessionMode("cloze")}
            className={`px-2 py-1 border-l border-[#111111] cursor-pointer ${
              sessionMode === "cloze" ? "bg-[#111111] text-[#B8FF01] font-bold" : "text-[#666666] hover:text-[#111111]"
            }`}
            title="Type the missing Spanish word"
          >
            Cloze
          </button>
        </div>

        {activeCardMode === "cloze" && (
          <button
            type="button"
            onClick={onToggleLenient}
            className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs border border-[#111111] bg-[#F8F8F6] hover:bg-white cursor-pointer"
          >
            <div
              className={`w-3.5 h-3.5 border border-[#111111] flex items-center justify-center ${
                lenientAccents ? "bg-[#B8FF01]" : "bg-white"
              }`}
            >
              {lenientAccents && <Check className="w-3 h-3 text-[#111111]" />}
            </div>
            <span className="hidden sm:inline text-[#111111]">Lenient accents</span>
          </button>
        )}
      </div>
    </div>
  );
};
