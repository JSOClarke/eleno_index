import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EpubParagraphBlock } from "./EpubParagraphBlock";
import { useEpubViewportPosition } from "@/hooks/useEpubViewportPosition";
import type { EpubChapter, EpubSettings, ParsedBlockResult, SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubReaderViewportProps {
  chapter: EpubChapter;
  chapterCount: number;
  parsedBlocks: Record<number, ParsedBlockResult>;
  settings: EpubSettings;
  statusMap: Record<string, UserVocabStatus>;
  selectedBlockIdx: number | null;
  selectedWordStart: number | null;
  initialPageIndex?: number;
  initialScrollTop?: number;
  onSelectWord: (blockIndex: number, ctx: SelectedWordContext) => void;
  onOpenWheel?: (ctx: SelectedWordContext, point: { x: number; y: number }) => void;
  onChangeChapter: (nextIndex: number) => void;
  onProgressChange?: (pos: { pageIndex: number; scrollTop: number }) => void;
  onVisibleBlocksChange?: (indices: number[]) => void;
}

export const EpubReaderViewport: React.FC<EpubReaderViewportProps> = ({
  chapter, chapterCount, parsedBlocks, settings, statusMap,
  selectedBlockIdx, selectedWordStart, initialPageIndex = 0, initialScrollTop = 0,
  onSelectWord, onOpenWheel, onChangeChapter, onProgressChange, onVisibleBlocksChange,
}) => {
  const pagedRef = useRef<HTMLDivElement>(null);
  const { pageIdx, pageCount, goPage } = useEpubViewportPosition({
    pagedRef, chapterIndex: chapter.index, chapterCount, scrollMode: settings.scrollMode,
    fontSize: settings.fontSize, parsedKey: Object.keys(parsedBlocks).length,
    initialPageIndex, initialScrollTop, onChangeChapter, onProgressChange, onVisibleBlocksChange,
  });

  useEffect(() => {
    if (settings.scrollMode !== "paged") return;
    const prevHtmlOv = document.documentElement.style.overflow;
    const prevBodyOv = document.body.style.overflow;
    const prevOs = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") goPage(1); else if (e.key === "ArrowLeft") goPage(-1); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevHtmlOv;
      document.body.style.overflow = prevBodyOv;
      document.body.style.overscrollBehavior = prevOs;
      window.removeEventListener("keydown", onKey);
    };
  }, [settings.scrollMode, goPage]);

  const themeCls = settings.theme === "dark" ? "bg-[#0A0A0C] text-zinc-100" : settings.theme === "sepia" ? "bg-[#FAF4E8] text-stone-800" : "bg-white text-slate-800";
  const renderBlocks = () => chapter.paragraphs.map((raw, idx) => (
    <div key={idx} data-block-idx={idx}>
      <EpubParagraphBlock
        rawText={raw} parsed={parsedBlocks[idx]} statusMap={statusMap}
        highlightMode={settings.highlightMode || (settings.highlightUnknown ? "status" : "off")}
        selectedWordStart={selectedBlockIdx === idx ? selectedWordStart : null}
        onSelectWord={(ctx) => onSelectWord(idx, ctx)}
        onOpenWheel={onOpenWheel}
      />
    </div>
  ));

  if (settings.scrollMode === "paged") {
    return (
      <div className={`fixed inset-x-0 top-[98px] bottom-0 z-10 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] ${themeCls}`}>
        <div
          ref={pagedRef}
          className="mx-auto w-full max-w-2xl flex-1 min-h-0 overflow-hidden px-5 py-5 font-serif"
          style={{ fontSize: `${settings.fontSize}px`, columnWidth: "min(39.5rem, calc(100vw - 2.5rem))", columnGap: "2.5rem", columnFill: "auto" }}
        >
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{chapter.title}</h2>
          {renderBlocks()}
        </div>
        <div className="mx-auto flex h-11 shrink-0 w-full max-w-4xl items-center justify-between border-t border-slate-200/30 px-4 text-xs">
          <button type="button" onClick={() => goPage(-1)} disabled={chapter.index === 0 && pageIdx === 0}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium opacity-80 hover:opacity-100 disabled:opacity-30 cursor-pointer">
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="tabular-nums opacity-60">Page {pageIdx + 1} / {pageCount}</span>
          <button type="button" onClick={() => goPage(1)} disabled={chapter.index >= chapterCount - 1 && pageIdx >= pageCount - 1}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium opacity-80 hover:opacity-100 disabled:opacity-30 cursor-pointer">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100dvh-6rem)] ${themeCls}`}>
      <article className="mx-auto max-w-2xl px-5 py-8 sm:px-8 font-serif" style={{ fontSize: `${settings.fontSize}px` }}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{chapter.title}</h2>
        {renderBlocks()}
        <div className="mt-10 flex items-center justify-between border-t border-slate-200/40 pt-6 font-sans text-xs">
          <button type="button" disabled={chapter.index === 0} onClick={() => onChangeChapter(chapter.index - 1)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 px-4 py-2 font-medium disabled:opacity-30 cursor-pointer hover:opacity-80">
            <ChevronLeft className="h-4 w-4" /> Previous Chapter
          </button>
          <button type="button" disabled={chapter.index >= chapterCount - 1} onClick={() => onChangeChapter(chapter.index + 1)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-30 cursor-pointer hover:bg-slate-800">
            Next Chapter <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    </div>
  );
};
