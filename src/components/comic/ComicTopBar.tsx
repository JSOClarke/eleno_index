import React from "react";
import type { ComicPageMeta, ComicReadingDirection } from "@/types/comicReader.types";

interface ComicTopBarProps {
  title: string;
  pages: ComicPageMeta[];
  currentPageIndex: number;
  readingDirection: ComicReadingDirection;
  zoom: number;
  showBoxes: boolean;
  onSelectPage: (idx: number) => void;
  onToggleReadingDirection: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onToggleBoxes: () => void;
  onBack: () => void;
}

export const ComicTopBar: React.FC<ComicTopBarProps> = ({
  title,
  pages,
  currentPageIndex,
  readingDirection,
  zoom,
  showBoxes,
  onSelectPage,
  onToggleReadingDirection,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onToggleBoxes,
  onBack,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#111111] bg-white text-[#111111]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 font-mono text-sm font-bold tracking-tight cursor-pointer"
          >
            <span>index</span>
            <span className="border border-[#111111] bg-[#B8FF01] px-1.5 py-0.5 text-xs font-bold text-[#111111]">
              /es
            </span>
          </button>
          <div className="hidden h-4 w-px bg-[#E2E2DF] sm:block" />
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 font-mono text-xs text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="hidden min-w-0 flex-1 truncate font-mono text-sm font-bold text-[#111111] xl:block">
            {title}
          </span>
          <span className="hidden text-[#888888] md:inline">·</span>
          <select
            value={currentPageIndex}
            onChange={(e) => onSelectPage(Number(e.target.value))}
            className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-xs font-medium cursor-pointer shadow-[2px_2px_0px_#111111] max-w-[180px] truncate"
          >
            {pages.map((p) => (
              <option key={p.index} value={p.index}>
                Page {p.index} of {pages.length}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={onToggleReadingDirection}
            className="border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] hover:bg-[#F4F4F2] shadow-[2px_2px_0px_#111111] cursor-pointer"
            title={`Reading direction: ${readingDirection.toUpperCase()}`}
          >
            Dir: {readingDirection.toUpperCase()}
          </button>

          <div className="hidden md:flex items-center border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              className="px-2 py-1 border-r border-[#111111] font-bold hover:bg-[#F4F4F2] cursor-pointer"
            >
              −
            </button>
            <button
              type="button"
              onClick={onFitWidth}
              className="px-2.5 py-1 font-bold hover:bg-[#F4F4F2] cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom in"
              className="px-2 py-1 border-l border-[#111111] font-bold hover:bg-[#F4F4F2] cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onFitWidth}
            className="hidden sm:inline border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F4F4F2] cursor-pointer"
          >
            Fit
          </button>

          <button
            type="button"
            onClick={onToggleBoxes}
            className={`border border-[#111111] px-2.5 py-1 font-bold shadow-[2px_2px_0px_#111111] cursor-pointer transition-colors ${
              showBoxes
                ? "bg-[#B8FF01] text-[#111111]"
                : "bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F2]"
            }`}
          >
            Boxes: {showBoxes ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </header>
  );
};
