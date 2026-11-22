import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EpubParagraphBlock } from "./EpubParagraphBlock";
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
  onSelectWord: (blockIndex: number, ctx: SelectedWordContext) => void;
  onChangeChapter: (nextIndex: number) => void;
}

export const EpubReaderViewport: React.FC<EpubReaderViewportProps> = ({
  chapter, chapterCount, parsedBlocks, settings, statusMap,
  selectedBlockIdx, selectedWordStart, onSelectWord, onChangeChapter,
}) => {
  const pagedRef = useRef<HTMLDivElement>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setPageIdx(0);
    if (pagedRef.current) pagedRef.current.scrollTo({ left: 0 });
  }, [chapter.index, settings.scrollMode]);

  useEffect(() => {
    if (settings.scrollMode !== "paged" || !pagedRef.current) return;
    const el = pagedRef.current;
    const measure = () => setPageCount(Math.max(1, Math.round(el.scrollWidth / (el.clientWidth || 1))));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [settings.scrollMode, settings.fontSize, chapter.index, parsedBlocks]);

  const goPage = (delta: number) => {
    const el = pagedRef.current;
    if (!el) return;
    const next = pageIdx + delta;
    if (next < 0 && chapter.index > 0) return onChangeChapter(chapter.index - 1);
    if (next >= pageCount && chapter.index < chapterCount - 1) return onChangeChapter(chapter.index + 1);
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    setPageIdx(clamped);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  const themeCls = settings.theme === "dark" ? "bg-slate-950 text-slate-200" : settings.theme === "sepia" ? "bg-[#FAF4E8] text-stone-800" : "bg-white text-slate-800";
  const renderBlocks = () => chapter.paragraphs.map((raw, idx) => (
    <EpubParagraphBlock
      key={idx} rawText={raw} parsed={parsedBlocks[idx]} statusMap={statusMap}
      highlightUnknown={settings.highlightUnknown}
      selectedWordStart={selectedBlockIdx === idx ? selectedWordStart : null}
      onSelectWord={(ctx) => onSelectWord(idx, ctx)}
    />
  ));

  if (settings.scrollMode === "paged") {
    return (
      <div className={`flex flex-1 flex-col justify-between min-h-[calc(100vh-3rem)] ${themeCls}`}>
        <div
          ref={pagedRef}
          className="mx-auto w-full max-w-4xl flex-1 overflow-x-hidden px-5 py-6 sm:px-8 font-serif"
          style={{ fontSize: `${settings.fontSize}px`, height: "calc(100vh - 7.5rem)", columnWidth: "min(42rem, calc(100vw - 2.5rem))", columnGap: "3rem" }}
        >
          <h2 className="mb-5 text-xl font-semibold tracking-tight">{chapter.title}</h2>
          {renderBlocks()}
        </div>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between border-t border-slate-200/30 px-4 py-2.5 text-xs">
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
    <div className={`min-h-[calc(100vh-3rem)] ${themeCls}`}>
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
