import React from "react";
import { ReaderHighlightControls } from "./ReaderHighlightControls";
import { ReaderMobileControls } from "./ReaderMobileControls";
import { ReaderSyncBadge } from "./ReaderSyncBadge";
import { RubyHintControl } from "./RubyHintControl";
import type { ElenoReaderChapterMeta, HighlightMode, ProgressSyncState, RubyPosFilter } from "@/types/reader.types";

interface ReaderTopBarProps {
  title: string;
  chapters: ElenoReaderChapterMeta[];
  currentChapterIndex: number;
  onSelectChapter: (idx: number) => void;
  showRuby: boolean;
  onToggleRuby: () => void;
  rubyPos: RubyPosFilter;
  onChangeRubyPos: (pos: RubyPosFilter) => void;
  showIPlusOne: boolean;
  onToggleIPlusOne: () => void;
  highlightMode: HighlightMode;
  onChangeHighlightMode: (mode: HighlightMode) => void;
  highlightUnknownOnly: boolean;
  onToggleHighlightUnknownOnly: () => void;
  fontSize: number;
  onAdjustFontSize: (delta: number) => void;
  progressSync: ProgressSyncState;
  onBack: () => void;
}

export const ReaderTopBar: React.FC<ReaderTopBarProps> = ({
  title,
  chapters,
  currentChapterIndex,
  onSelectChapter,
  showRuby,
  onToggleRuby,
  rubyPos,
  onChangeRubyPos,
  showIPlusOne,
  onToggleIPlusOne,
  highlightMode,
  onChangeHighlightMode,
  highlightUnknownOnly,
  onToggleHighlightUnknownOnly,
  fontSize,
  onAdjustFontSize,
  progressSync,
  onBack,
}) => {
  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-[#111111] bg-white xl:block">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button onClick={onBack} className="flex items-center gap-1 font-mono text-sm font-bold tracking-tight cursor-pointer">
            <span>index</span>
            <span className="bg-[#B8FF01] text-[#111111] px-1.5 py-0.5 text-xs font-bold border border-[#111111]">/es</span>
          </button>
          <div className="h-4 w-px bg-[#E2E2DF] hidden sm:block" />
          <button onClick={onBack} className="font-mono text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1 cursor-pointer">
            ← Back
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="hidden min-w-0 flex-1 truncate font-mono text-sm font-bold text-[#111111] xl:block">{title}</span>
          <span className="text-[#888888] hidden md:inline">·</span>
          <select
            value={currentChapterIndex}
            onChange={(e) => onSelectChapter(Number(e.target.value))}
            className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-xs font-medium cursor-pointer shadow-[2px_2px_0px_#111111] max-w-[180px] truncate"
          >
            {chapters.map((ch) => (
              <option key={ch.index} value={ch.index}>
                Ch. {ch.index}: {ch.title} ({ch.token_count.toLocaleString()}w)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs shrink-0">
          <ReaderSyncBadge state={progressSync} />
          <ReaderHighlightControls
            mode={highlightMode}
            onChangeMode={onChangeHighlightMode}
            unknownOnly={highlightUnknownOnly}
            onToggleUnknownOnly={onToggleHighlightUnknownOnly}
          />

          <button
            type="button"
            onClick={onToggleRuby}
            className={`border border-[#111111] px-2.5 py-1 font-bold cursor-pointer transition-colors ${
              showRuby ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#666666] hover:text-[#111111]"
            }`}
          >
            Ruby: {showRuby ? "ON" : "OFF"}
          </button>

          <RubyHintControl
            showRuby={showRuby}
            rubyPos={rubyPos}
            onChange={onChangeRubyPos}
          />

          <button
            type="button"
            onClick={onToggleIPlusOne}
            className={`border border-[#111111] px-2.5 py-1 font-medium cursor-pointer transition-colors ${
              showIPlusOne ? "bg-[#B8FF01] text-[#111111] font-bold" : "bg-white text-[#666666] hover:text-[#111111]"
            }`}
          >
            i+1: {showIPlusOne ? "ON" : "OFF"}
          </button>

          <div className="hidden md:flex items-center border border-[#111111]">
            <button type="button" onClick={() => onAdjustFontSize(-1)} className="px-2 py-1 bg-white hover:bg-[#F4F4F2] border-r border-[#111111] font-bold">A-</button>
            <button type="button" onClick={() => onAdjustFontSize(1)} className="px-2 py-1 bg-white hover:bg-[#F4F4F2] font-bold">A+</button>
          </div>
        </div>
      </div>
      </header>

      <ReaderMobileControls
        title={title}
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={onSelectChapter}
        onBack={onBack}
        fontSize={fontSize}
        onAdjustFontSize={onAdjustFontSize}
        showRuby={showRuby}
        onToggleRuby={onToggleRuby}
        rubyPos={rubyPos}
        onChangeRubyPos={onChangeRubyPos}
        showIPlusOne={showIPlusOne}
        onToggleIPlusOne={onToggleIPlusOne}
        highlightMode={highlightMode}
        onChangeHighlightMode={onChangeHighlightMode}
        highlightUnknownOnly={highlightUnknownOnly}
        onToggleHighlightUnknownOnly={onToggleHighlightUnknownOnly}
        progressSync={progressSync}
      />
      <div className="h-14 xl:hidden" aria-hidden="true" />
    </>
  );
};
