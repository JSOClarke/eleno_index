import React from "react";

interface ReaderBottomBarProps {
  chapterIndex: number;
  totalChapters: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ReaderBottomBar: React.FC<ReaderBottomBarProps> = ({
  chapterIndex,
  totalChapters,
  onPrev,
  onNext,
}) => (
  <footer className="fixed inset-x-0 bottom-0 z-30 w-screen max-w-[100vw] overflow-x-hidden border-t border-[#E2E2DF] bg-[#F8F8F6] pb-[env(safe-area-inset-bottom)]">
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
