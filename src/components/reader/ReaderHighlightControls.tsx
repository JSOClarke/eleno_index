import React, { useState } from "react";
import { CEFR_BANDS, RANK_BANDS } from "@/lib/readerHighlight";
import type { HighlightMode } from "@/types/reader.types";

interface ReaderHighlightControlsProps {
  mode: HighlightMode;
  onChangeMode: (mode: HighlightMode) => void;
  unknownOnly: boolean;
  onToggleUnknownOnly: () => void;
}

export const ReaderHighlightControls: React.FC<ReaderHighlightControlsProps> = ({
  mode,
  onChangeMode,
  unknownOnly,
  onToggleUnknownOnly,
}) => {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="relative flex items-center gap-1.5 font-mono text-xs">
      <div className="flex items-center border border-[#111111] bg-white">
        {(["none", "cefr", "rank"] as HighlightMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChangeMode(m)}
            className={`px-2 py-1 uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              mode === m
                ? "bg-[#111111] text-[#B8FF01]"
                : "text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F2]"
            } ${m !== "none" ? "border-l border-[#111111]" : ""}`}
          >
            {m === "none" ? "Bands: Off" : m}
          </button>
        ))}
      </div>

      {mode !== "none" && (
        <>
          <button
            type="button"
            onClick={onToggleUnknownOnly}
            className={`border border-[#111111] px-2 py-1 font-bold tracking-tight cursor-pointer transition-colors ${
              unknownOnly ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#888888] hover:text-[#111111]"
            }`}
            title="When active, only words not marked as Known receive colored underlines"
          >
            Unknown only: {unknownOnly ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => setShowLegend((p) => !p)}
            className="border border-[#111111] px-1.5 py-1 bg-white hover:bg-[#F4F4F2] text-[#111111] font-bold cursor-pointer"
            title="Toggle color legend"
          >
            ?
          </button>
        </>
      )}

      {showLegend && mode !== "none" && (
        <div className="absolute right-0 top-full mt-2 z-40 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] p-3 w-56">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAEAE6]">
            <span className="font-bold text-[11px] tracking-wider uppercase text-[#111111]">
              {mode === "cefr" ? "CEFR Difficulty Bands" : "Frequency Rank Bands"}
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[#888888] hover:text-[#111111] font-bold px-1"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {mode === "cefr"
              ? Object.values(CEFR_BANDS).map((b) => (
                  <div key={b.key} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-3 h-0.5 border-b-[3px] ${b.border}`} />
                    <span className="font-bold">{b.label}</span>
                  </div>
                ))
              : RANK_BANDS.filter((b) => b.border).map((b) => (
                  <div key={b.key} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-3 h-0.5 border-b-[3px] ${b.border}`} />
                    <span className="font-bold">{b.label}</span>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
};
