import React from "react";
import { ArrowLeft, BookOpen, Columns2, List, ScrollText, Settings2, Sparkles } from "lucide-react";
import type { EpubScrollMode, EpubTheme } from "@/types/epubReader.types";

interface EpubReaderHeaderProps {
  title: string;
  chapterTitle: string;
  chapterIndex: number;
  chapterCount: number;
  parsing: boolean;
  autoParse: boolean;
  theme: EpubTheme;
  scrollMode: EpubScrollMode;
  onBack: () => void;
  onParseNow: () => void;
  onToggleToc: () => void;
  onToggleScrollMode: () => void;
  onToggleSettings: () => void;
}

export const EpubReaderHeader: React.FC<EpubReaderHeaderProps> = ({
  title, chapterTitle, chapterIndex, chapterCount, parsing, autoParse,
  theme, scrollMode, onBack, onParseNow, onToggleToc, onToggleScrollMode, onToggleSettings,
}) => {
  const isDark = theme === "dark";
  const barCls = isDark
    ? "border-slate-800 bg-slate-950/95 text-slate-100"
    : theme === "sepia"
      ? "border-amber-200/70 bg-[#FAF4E8]/95 text-stone-900"
      : "border-slate-200/80 bg-white/95 text-slate-900";
  const btnCls = isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600";

  return (
    <header className={`sticky top-12 z-20 border-b backdrop-blur-md ${barCls}`}>
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Back to bookshelf"
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition ${btnCls}`}>
            <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Shelf</span>
          </button>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{title}</div>
            <div className="truncate text-[11px] opacity-60">{chapterTitle} · {chapterIndex + 1}/{chapterCount}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {parsing ? (
            <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-medium text-white">
              <BookOpen className="h-3 w-3 animate-pulse" /><span>Parsing…</span>
            </span>
          ) : !autoParse && (
            <button type="button" onClick={onParseNow}
              className="mr-1 inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 cursor-pointer">
              <Sparkles className="h-3 w-3" /><span>{scrollMode === "paged" ? "Parse Page" : "Parse"}</span>
            </button>
          )}
          <button type="button" onClick={onToggleScrollMode} aria-label="Toggle reading mode"
            title={scrollMode === "scroll" ? "Switch to Horizontal Paged mode" : "Switch to Vertical Scroll mode"}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition ${btnCls}`}>
            {scrollMode === "scroll" ? <ScrollText className="h-4 w-4" /> : <Columns2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{scrollMode === "scroll" ? "Scroll" : "Paged"}</span>
          </button>
          <button type="button" onClick={onToggleToc} aria-label="Table of contents" className={`rounded-lg p-1.5 cursor-pointer transition ${btnCls}`}><List className="h-4 w-4" /></button>
          <button type="button" onClick={onToggleSettings} aria-label="Reader settings" className={`rounded-lg p-1.5 cursor-pointer transition ${btnCls}`}><Settings2 className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
};
