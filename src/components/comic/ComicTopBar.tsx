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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#111111] bg-white px-4 font-mono text-xs text-[#111111]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <span className="truncate font-bold font-serif text-sm text-[#111111] max-w-[180px] sm:max-w-xs md:max-w-md">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={currentPageIndex}
          onChange={(e) => onSelectPage(Number(e.target.value))}
          className="border border-[#111111] bg-white px-2 py-1 font-mono text-xs font-medium text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-none cursor-pointer"
        >
          {pages.map((p) => (
            <option key={p.index} value={p.index} className="text-[#111111] bg-white">
              Page {p.index} / {pages.length}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onToggleReadingDirection}
          title={`Reading direction: ${readingDirection.toUpperCase()}`}
          className="border border-[#111111] bg-white px-2.5 py-1 font-bold uppercase text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          {readingDirection.toUpperCase()}
        </button>

        <div className="hidden sm:flex items-center border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="px-2.5 py-1 border-r border-[#111111] font-bold text-[#111111] hover:bg-neutral-100 cursor-pointer"
          >
            −
          </button>
          <span className="px-2 py-1 text-center min-w-[52px] font-bold text-[#111111]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="px-2.5 py-1 border-l border-[#111111] font-bold text-[#111111] hover:bg-neutral-100 cursor-pointer"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onFitWidth}
          className="hidden sm:inline border border-[#111111] bg-white px-2.5 py-1 font-bold text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          Fit
        </button>

        <button
          type="button"
          onClick={onToggleBoxes}
          title="Toggle OCR Word Boxes"
          className={`border border-[#111111] px-2.5 py-1 font-bold shadow-[2px_2px_0px_#111111] transition-colors cursor-pointer ${
            showBoxes
              ? "bg-[#B8FF01] text-[#111111]"
              : "bg-white text-[#111111] hover:bg-neutral-100"
          }`}
        >
          Boxes
        </button>
      </div>
    </header>
  );
};
