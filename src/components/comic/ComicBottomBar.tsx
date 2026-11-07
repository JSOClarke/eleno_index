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

  const prevText = readingDirection === "rtl" ? "Next page →" : "← Previous page";
  const nextText = readingDirection === "rtl" ? "← Previous page" : "Next page →";

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 w-screen max-w-[100vw] overflow-x-hidden border-t border-[#E2E2DF] bg-[#F8F8F6] text-[#111111] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 font-mono text-xs sm:px-6">
        <button
          type="button"
          disabled={isFirst}
          onClick={onPrev}
          className="flex items-center gap-1 font-bold text-[#111111] hover:underline disabled:opacity-40 cursor-pointer"
        >
          {prevText}
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block h-1.5 w-32 bg-[#E2E2DF] border border-[#111111] overflow-hidden">
            <div
              style={{ width: `${pct}%` }}
              className="h-full bg-[#111111] transition-all duration-150"
            />
          </div>
          <span className="text-[#666666]">
            Page <strong className="text-[#111111]">{currentPageIndex}</strong> of {totalPages} ({pct}%)
          </span>
        </div>

        <button
          type="button"
          disabled={isLast}
          onClick={onNext}
          className="flex items-center gap-1 font-bold text-[#111111] hover:underline disabled:opacity-40 cursor-pointer"
        >
          {nextText}
        </button>
      </div>
    </footer>
  );
};
