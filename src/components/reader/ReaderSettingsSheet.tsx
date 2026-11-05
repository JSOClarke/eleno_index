import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { HighlightMode, RubyPosFilter } from "@/types/reader.types";
import { RubyHintControl } from "./RubyHintControl";

interface ReaderSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  fontSize: number;
  onAdjustFontSize: (delta: number) => void;
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
}

const toggleClass = (active: boolean) =>
  `flex w-full items-center justify-between border border-[#111111] px-3 py-2 font-mono text-xs font-bold cursor-pointer ${
    active ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#666666]"
  }`;

/** Phone-only reader settings; desktop keeps the inline top-bar controls. */
export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({
  open,
  onClose,
  fontSize,
  onAdjustFontSize,
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
}) => (
  <Sheet open={open} onClose={onClose} title="Reader settings" className="xl:hidden">
    <div className="space-y-5">
      <div>
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
          Text size
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjustFontSize(-1)}
            className="border border-[#111111] px-4 py-2 font-mono text-sm font-bold cursor-pointer"
          >
            A−
          </button>
          <span className="min-w-[48px] text-center font-mono text-sm font-bold tabular-nums">
            {fontSize}px
          </span>
          <button
            type="button"
            onClick={() => onAdjustFontSize(1)}
            className="border border-[#111111] px-4 py-2 font-mono text-sm font-bold cursor-pointer"
          >
            A+
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <button type="button" onClick={onToggleIPlusOne} className={toggleClass(showIPlusOne)}>
          <span>i+1 sentences</span>
          <span>{showIPlusOne ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
          Ruby hints
        </div>
        <button type="button" onClick={onToggleRuby} className={toggleClass(showRuby)}>
          <span>Show above-word hints</span>
          <span>{showRuby ? "ON" : "OFF"}</span>
        </button>
        {showRuby && (
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              Hint part of speech
            </span>
            <RubyHintControl
              showRuby={showRuby}
              rubyPos={rubyPos}
              onChange={onChangeRubyPos}
            />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
          Underline bands
        </div>
        <div className="flex">
          {(["none", "cefr", "rank"] as HighlightMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChangeHighlightMode(mode)}
              className={`flex-1 border border-[#111111] px-2 py-2 font-mono text-xs font-bold uppercase cursor-pointer ${
                mode !== "none" ? "border-l-0" : ""
              } ${highlightMode === mode ? "bg-[#111111] text-[#B8FF01]" : "bg-white text-[#666666]"}`}
            >
              {mode === "none" ? "Off" : mode}
            </button>
          ))}
        </div>
        {highlightMode !== "none" && (
          <button
            type="button"
            onClick={onToggleHighlightUnknownOnly}
            className={`mt-2 ${toggleClass(highlightUnknownOnly)}`}
          >
            <span>Unknown words only</span>
            <span>{highlightUnknownOnly ? "ON" : "OFF"}</span>
          </button>
        )}
      </div>
    </div>
  </Sheet>
);
