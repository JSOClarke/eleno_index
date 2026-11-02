import React from "react";
import { formatCompactWords, formatNumber, formatPercent } from "@/lib/formatters";
import type { MediaChapterMetrics } from "@/types/media.types";

interface ChapterPacingStripProps {
  chapters: MediaChapterMetrics[];
  loading?: boolean;
  selectedChapter: number | "all";
  onSelectChapter: (ch: number | "all") => void;
}

export const ChapterPacingStrip: React.FC<ChapterPacingStripProps> = ({
  chapters,
  loading = false,
  selectedChapter,
  onSelectChapter,
}) => {
  if (loading && chapters.length === 0) {
    return (
      <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-4 space-y-4">
        <div className="h-4 w-64 bg-[#E2E2DF] animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="w-24 h-24 shrink-0 border border-[#E2E2DF] bg-white animate-pulse" />
          ))}
        </div>
        <div className="h-4 w-full bg-[#E2E2DF] animate-pulse" />
      </div>
    );
  }

  if (!chapters || chapters.length === 0) return null;

  const currentCh =
    selectedChapter === "all"
      ? chapters[0]
      : chapters.find((c) => c.chapter_index === selectedChapter) || chapters[0];
  const maxTokens = Math.max(...chapters.map((c) => c.total_tokens || 1), 4000);
  const hasUserFlow = chapters.some((c) => c.user_comprehension !== undefined);
  const flowPct =
    currentCh.user_comprehension?.text_coverage_percentage ??
    currentCh.user_comprehension?.chapter_comprehension_percentage ??
    null;

  return (
    <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-4 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-[#111111] font-semibold">
          CHAPTER PACING & DUAL COVERAGE ({chapters.length} CHAPTERS)
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#555555]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-white border border-[#111111]" />
            Outline Height = Chapter Length
          </span>
          {hasUserFlow && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-[#111111]" />
              Solid Ink Fill = Known Flow %
            </span>
          )}
          <span className="text-[#777777]">· Click chapter to filter table</span>
        </div>
      </div>

      <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => onSelectChapter("all")}
          className={`w-20 shrink-0 border p-2.5 flex flex-col justify-between text-left transition-all cursor-pointer ${
            selectedChapter === "all"
              ? "border-[#111111] bg-[#B8FF01]"
              : "border-[#E2E2DF] bg-white hover:border-[#111111]"
          }`}
        >
          <span className="font-mono text-[10px] font-bold">ALL</span>
          <span className="font-mono text-xs font-bold leading-tight">Full Book</span>
          <span className="font-mono text-[10px] text-[#555555]">{chapters.length} ch</span>
        </button>

        {chapters.map((ch) => {
          const active = selectedChapter === ch.chapter_index;
          const lengthHeightPct = Math.min(
            100,
            Math.max(22, Math.round(((ch.total_tokens || 0) / maxTokens) * 100))
          );
          const chFlow =
            ch.user_comprehension?.text_coverage_percentage ??
            ch.user_comprehension?.chapter_comprehension_percentage ??
            null;
          const fillPct = chFlow !== null ? Math.min(100, Math.max(0, Math.round(chFlow))) : 100;

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChapter(active ? "all" : ch.chapter_index)}
              title={`Chapter ${ch.chapter_index}: ${ch.chapter_title} (${formatNumber(ch.total_tokens)} words${chFlow !== null ? ` · ${chFlow.toFixed(1)}% reading flow` : ""})`}
              className={`w-24 shrink-0 border p-2.5 text-left transition-all cursor-pointer ${
                active
                  ? "border-[#111111] bg-[#B8FF01]"
                  : "border-[#E2E2DF] bg-white hover:border-[#111111]"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold">CH.{ch.chapter_index}</span>
                <span>{ch.cefr_level || "B1"}</span>
              </div>
              <div className="h-11 flex items-end mt-2 mb-1.5 border-b border-[#111111] px-1">
                <div
                  className="w-full bg-white border border-b-0 border-[#111111] flex flex-col justify-end overflow-hidden transition-all"
                  style={{ height: `${lengthHeightPct}%` }}
                >
                  <div
                    className="w-full bg-[#111111] transition-all"
                    style={{ height: `${fillPct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] tabular-nums">
                <span className="font-semibold text-[#111111]">
                  {chFlow !== null ? `${Math.round(chFlow)}%` : formatCompactWords(ch.total_tokens).replace(" words", "")}
                </span>
                <span className="text-[#666666]">
                  {chFlow !== null ? formatCompactWords(ch.total_tokens).replace(" words", "") : "tok"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#E2E2DF] pt-2.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="font-bold text-[#111111]">
            Chapter {currentCh.chapter_index}: {currentCh.chapter_title}
          </span>
          <span className="text-[#666666] ml-2">
            · {formatNumber(currentCh.total_tokens)} tokens · {formatNumber(currentCh.unique_words_count)} lemmas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>F-H: <strong>{(currentCh.readability_score || 70).toFixed(1)}</strong></span>
          <span>Dialogue: <strong>{formatPercent(currentCh.dialogue_ratio, 1)}</strong></span>
          {flowPct !== null && <span>Reading Flow: <strong>{flowPct.toFixed(1)}%</strong></span>}
        </div>
      </div>
    </div>
  );
};
