import React from "react";

interface ReaderBottomBarProps {
  chapterIndex: number;
  totalChapters: number;
  percentage: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ReaderBottomBar: React.FC<ReaderBottomBarProps> = ({
  chapterIndex,
  totalChapters,
  percentage,
  onPrev,
  onNext,
}) => (
  <footer className="sticky bottom-0 z-30 border-t-2 border-[#111111] bg-[#F8F8F6] pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-3 font-mono text-xs sm:px-6">
      <button
        disabled={chapterIndex <= 1}
        onClick={onPrev}
        className="flex items-center gap-1 hover:underline disabled:opacity-40"
      >
        ← Previous
      </button>
      <div className="flex items-center gap-3">
        <span className="text-[#666666]">
          Chapter {chapterIndex} of {totalChapters}
        </span>
        <span className="text-[#CCCCCC]">·</span>
        <span className="font-bold tabular-nums">{percentage}% read</span>
        <div className="hidden h-2 w-20 border border-[#111111] bg-white sm:flex overflow-hidden">
          <div className="h-full bg-[#111111]" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <button
        disabled={chapterIndex >= totalChapters}
        onClick={onNext}
        className="flex items-center gap-1 hover:underline disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  </footer>
);
