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
  <footer className="sticky bottom-0 z-30 h-12 border-t border-[#111111] bg-[#F8F8F6]">
    <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 font-mono text-xs">
      <button
        disabled={chapterIndex <= 1}
        onClick={onPrev}
        className="flex items-center gap-1 hover:underline disabled:opacity-40"
      >
        ← Anterior
      </button>
      <div className="flex items-center gap-3">
        <span className="text-[#666666]">
          Capítulo {chapterIndex} de {totalChapters}
        </span>
        <span className="text-[#CCCCCC]">·</span>
        <span className="font-bold tabular-nums">{percentage}% leído</span>
        <div className="hidden h-2 w-20 border border-[#111111] bg-white sm:flex overflow-hidden">
          <div className="h-full bg-[#111111]" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <button
        disabled={chapterIndex >= totalChapters}
        onClick={onNext}
        className="flex items-center gap-1 hover:underline disabled:opacity-40"
      >
        Siguiente →
      </button>
    </div>
  </footer>
);
