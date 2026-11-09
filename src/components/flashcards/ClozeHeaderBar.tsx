import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

interface ClozeHeaderBarProps {
  currentIndex: number;
  totalCards: number;
  streak: number;
  lenientAccents: boolean;
  onToggleLenient: () => void;
}

export const ClozeHeaderBar: React.FC<ClozeHeaderBarProps> = ({
  currentIndex,
  totalCards,
  streak,
  lenientAccents,
  onToggleLenient,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-3 mb-6">
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
        {streak > 1 && (
          <span className="hidden sm:inline bg-[#B8FF01] text-[#111111] px-2 py-0.5 font-mono text-xs font-bold border border-[#111111]">
            🔥 {streak} STREAK
          </span>
        )}
      </div>

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
        <span className="text-[#111111]">Lenient accents</span>
      </button>
    </div>
  );
};
