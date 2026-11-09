import React from "react";
import { RotateCcw, BookOpen, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { FlashcardSessionStats } from "@/types/flashcard.types";

interface FlashcardSummaryScreenProps {
  stats: FlashcardSessionStats;
  remainingCount?: number;
  onRestart: () => void;
}

export const FlashcardSummaryScreen: React.FC<FlashcardSummaryScreenProps> = ({
  stats,
  remainingCount = 0,
  onRestart,
}) => {
  const accuracy = stats.completed > 0 ? Math.round((stats.correct / stats.completed) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-center">
      <div className="space-y-3">
        <div className="inline-flex p-3 bg-[#B8FF01] border-2 border-[#111111]">
          <Award className="w-8 h-8 text-[#111111]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
          Session Complete!
        </h1>
        <p className="font-mono text-sm text-[#666666]">
          {remainingCount > 0
            ? `You completed this 20-card sprint. ${remainingCount} more card${remainingCount > 1 ? "s" : ""} due in your backlog.`
            : "Awesome work! All due flashcards in your deck have been reviewed."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#F8F8F6] border border-[#111111] text-left">
          <div className="font-mono text-xs text-[#666666] uppercase">Reviewed</div>
          <div className="font-mono text-2xl font-bold text-[#111111] mt-1">{stats.completed}</div>
        </div>
        <div className="p-4 bg-[#F8F8F6] border border-[#111111] text-left">
          <div className="font-mono text-xs text-[#666666] uppercase">Accuracy</div>
          <div className="font-mono text-2xl font-bold text-[#111111] mt-1">{accuracy}%</div>
        </div>
        <div className="p-4 bg-[#F8F8F6] border border-[#111111] text-left">
          <div className="font-mono text-xs text-[#666666] uppercase">Correct</div>
          <div className="font-mono text-2xl font-bold text-[#2E7D32] mt-1">{stats.correct}</div>
        </div>
        <div className="p-4 bg-[#F8F8F6] border border-[#111111] text-left">
          <div className="font-mono text-xs text-[#666666] uppercase">Best Streak</div>
          <div className="font-mono text-2xl font-bold text-[#111111] mt-1">🔥 {stats.streak}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] text-[#B8FF01] font-mono text-sm font-bold border-2 border-[#111111] hover:bg-[#222222] shadow-[3px_3px_0px_#111111] cursor-pointer"
        >
          {remainingCount > 0 ? <ArrowRight className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
          <span>{remainingCount > 0 ? `START NEXT 20 CARDS (${remainingCount} LEFT)` : "CHECK FOR MORE REVIEWS"}</span>
        </button>
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#111111] font-mono text-sm font-bold border-2 border-[#111111] hover:bg-[#F4F4F2] cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>BACK TO CATALOGUE</span>
        </Link>
      </div>
    </div>
  );
};
