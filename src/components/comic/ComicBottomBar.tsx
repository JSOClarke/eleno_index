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

  const prevLabel = readingDirection === "rtl" ? "Next (→)" : "Prev (←)";
  const nextLabel = readingDirection === "rtl" ? "(←) Prev" : "Next (→)";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 flex h-12 w-full items-center justify-between border-t border-[#E2E2DF] bg-[#F8F8F6] px-4 font-mono text-xs text-[#111111]">
      <button
        type="button"
        disabled={isFirst}
        onClick={onPrev}
        className="border border-[#111111] bg-white px-3 py-1 font-bold text-[#111111] shadow-[2px_2px_0px_#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#111111] hover:enabled:text-white transition-colors cursor-pointer"
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
        <span className="font-bold text-[#111111]">
          Page {currentPageIndex} of {totalPages} ({pct}%)
        </span>
      </div>

      <button
        type="button"
        disabled={isLast}
        onClick={onNext}
        className="border border-[#111111] bg-white px-3 py-1 font-bold text-[#111111] shadow-[2px_2px_0px_#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#111111] hover:enabled:text-white transition-colors cursor-pointer"
      >
        {nextLabel}
      </button>
    </footer>
  );
};
