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
  isNewCard?: boolean;
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
  isNewCard = false,
}) => {
  const remaining = Math.max(0, totalCards - currentIndex);
  const progressPct = totalCards > 0 ? Math.round(((totalCards - remaining) / totalCards) * 100) : 0;

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/"
            className="p-1.5 border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
            title="Exit review"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-[#111111]">
              {remaining} REMAINING
            </span>
            <span className="font-mono text-xs text-[#888888]">
              · Card {Math.min(currentIndex + 1, totalCards)} of {totalCards}
            </span>
          </div>
          <span
            className={`border border-[#111111] px-2 py-0.5 font-mono text-[11px] font-bold ${
              isNewCard ? "bg-[#E0F2FE] text-[#0369A1]" : "bg-white text-[#111111]"
            }`}
          >
            {isNewCard ? "✨ NEW" : "🔄 REVIEW"}
          </span>
          <span
            className={`border border-[#111111] px-2 py-0.5 font-mono text-[11px] font-bold ${
              activeCardMode === "recognition" ? "bg-[#B8FF01] text-[#111111]" : "bg-[#111111] text-white"
            }`}
          >
            {activeCardMode === "recognition" ? "RECOG" : "CLOZE"}
          </span>
          {streak > 1 && (
            <span className="hidden md:inline bg-[#F8F8F6] text-[#111111] px-2 py-0.5 font-mono text-xs border border-[#E8E8E4]">
              🔥 {streak}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex border border-[#111111] font-mono text-xs bg-white">
            {(["auto", "recognition", "cloze"] as const).map((mode, i) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeSessionMode(mode)}
                className={`px-2.5 py-1 cursor-pointer ${i > 0 ? "border-l border-[#111111]" : ""} ${
                  sessionMode === mode ? "bg-[#111111] text-[#B8FF01] font-bold" : "text-[#666666] hover:text-[#111111]"
                }`}
              >
                {mode === "auto" ? "Auto" : mode === "recognition" ? "Recog" : "Cloze"}
              </button>
            ))}
          </div>

          {activeCardMode === "cloze" && (
            <button
              type="button"
              onClick={onToggleLenient}
              className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs border border-[#111111] bg-white hover:bg-[#F8F8F6] cursor-pointer"
            >
              <div className={`w-3.5 h-3.5 border border-[#111111] flex items-center justify-center ${lenientAccents ? "bg-[#B8FF01]" : "bg-white"}`}>
                {lenientAccents && <Check className="w-3 h-3 text-[#111111]" />}
              </div>
              <span className="hidden sm:inline text-[#111111]">Lenient</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-1 bg-[#E8E8E4] overflow-hidden">
        <div className="h-full bg-[#111111] transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
};
