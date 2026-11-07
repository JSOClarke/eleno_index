import React from "react";
import type { ComicReadingDirection } from "@/types/comicReader.types";

interface ComicBottomBarProps {
  currentPageIndex: number;
  totalPages: number;
  readingDirection: ComicReadingDirection;
  onPrev: () => void;
  onNext: () => void;
}

export const ComicBottomBar: React.FC<ComicBottomBarProps> = ({
  currentPageIndex,
  totalPages,
  readingDirection,
  onPrev,
  onNext,
}) => {
  const isFirst = currentPageIndex <= 1;
  const isLast = currentPageIndex >= totalPages;
  const pct = Math.round((currentPageIndex / Math.max(1, totalPages)) * 100);

  // In RTL mode, "Next" page in narrative order is triggered by Left arrow
  const prevLabel = readingDirection === "rtl" ? "Next (→)" : "Prev (←)";
  const nextLabel = readingDirection === "rtl" ? "(←) Prev" : "Next (→)";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 flex h-12 w-full items-center justify-between border-t border-[#111111] bg-white px-4 font-mono text-xs">
      <button
        type="button"
        disabled={isFirst}
        onClick={onPrev}
        className="border border-[#111111] px-3 py-1 font-bold shadow-[2px_2px_0px_#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#111111] hover:enabled:text-white"
      >
        {prevLabel}
      </button>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block h-1.5 w-32 bg-neutral-200 border border-[#111111] overflow-hidden">
          <div
            style={{ width: `${pct}%` }}
            className="h-full bg-[#111111] transition-all duration-150"
          />
        </div>
        <span className="font-bold text-neutral-800">
          {currentPageIndex} / {totalPages} ({pct}%)
        </span>
      </div>

      <button
        type="button"
        disabled={isLast}
        onClick={onNext}
        className="border border-[#111111] px-3 py-1 font-bold shadow-[2px_2px_0px_#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#111111] hover:enabled:text-white"
      >
        {nextLabel}
      </button>
    </footer>
  );
};
