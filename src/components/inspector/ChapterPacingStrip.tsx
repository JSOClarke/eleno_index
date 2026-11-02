import React, { useState } from "react";
import { formatNumber } from "@/lib/formatters";
import type { MediaChapterMetrics } from "@/types/media.types";

interface ChapterPacingStripProps {
  chapters: MediaChapterMetrics[];
}

export const ChapterPacingStrip: React.FC<ChapterPacingStripProps> = ({
  chapters,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(
    chapters[0]?.chapter_index || 1
  );

  if (!chapters || chapters.length === 0) return null;

  const currentCh =
    chapters.find((c) => c.chapter_index === selectedIdx) || chapters[0];
  const maxTokens = Math.max(...chapters.map((c) => c.total_tokens || 1), 4000);
  const flowPct =
    currentCh.user_comprehension?.text_coverage_percentage ??
    currentCh.user_comprehension?.chapter_comprehension_percentage ??
    null;

  return (
    <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-[#111111] font-semibold">
          CHAPTER PACING & DUAL COVERAGE ({chapters.length} CHAPTERS)
        </div>
        <div className="font-mono text-xs text-[#666666]">
          Click any chapter bar to inspect pacing
        </div>
      </div>

      {/* Bar Strip */}
      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2">
        {chapters.map((ch) => {
          const active = ch.chapter_index === currentCh.chapter_index;
          const heightPct = Math.min(
            100,
            Math.max(25, Math.round(((ch.total_tokens || 0) / maxTokens) * 100))
          );
          const chFlow =
            ch.user_comprehension?.text_coverage_percentage ??
            ch.user_comprehension?.chapter_comprehension_percentage ??
            null;

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setSelectedIdx(ch.chapter_index)}
              className={`border p-2.5 text-left transition-all cursor-pointer ${
                active
                  ? "border-[#111111] bg-[#B8FF01]"
                  : "border-[#E2E2DF] bg-white hover:border-[#111111]"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold">CH.{ch.chapter_index}</span>
                <span>{ch.cefr_level || "B1"}</span>
              </div>
              <div className="h-10 flex items-end mt-2 mb-1 bg-[#EAEAE6] p-0.5">
                <div
                  className="w-full bg-[#111111]"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <div className="font-mono text-[10px] tabular-nums font-medium">
                {chFlow !== null
                  ? `${Math.round(chFlow)}% flow`
                  : `${formatNumber(ch.total_tokens)} tok`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Chapter Detail Strip */}
      <div className="border-t border-[#E2E2DF] pt-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="font-bold text-[#111111]">
            Chapter {currentCh.chapter_index}: {currentCh.chapter_title}
          </span>
          <span className="text-[#666666] ml-2">
            · {formatNumber(currentCh.total_tokens)} tokens ·{" "}
            {formatNumber(currentCh.unique_words_count)} lemmas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            F-H Readability:{" "}
            <strong>{(currentCh.readability_score || 70).toFixed(1)}</strong>
          </span>
          <span>
            Dialogue:{" "}
            <strong>{((currentCh.dialogue_ratio || 0) * 100).toFixed(1)}%</strong>
          </span>
          {flowPct !== null && (
            <span>
              Reading Flow: <strong>{flowPct.toFixed(1)}%</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
