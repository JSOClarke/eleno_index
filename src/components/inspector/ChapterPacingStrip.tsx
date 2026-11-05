import React from "react";
import { formatCompactWords, formatLearningDelta, formatNumber } from "@/lib/formatters";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";
import type {
  MediaChapterMetrics,
  MediaComprehensionStats,
  MediaMetrics,
} from "@/types/media.types";
import { ChapterPacingSummary } from "./ChapterPacingSummary";

interface ChapterPacingStripProps {
  chapters: MediaChapterMetrics[];
  loading?: boolean;
  selectedChapter: number | "all";
  onSelectChapter: (ch: number | "all") => void;
  bookMetrics?: MediaMetrics | null;
  bookComprehension?: MediaComprehensionStats | null;
}

export const ChapterPacingStrip: React.FC<ChapterPacingStripProps> = ({
  chapters,
  loading = false,
  selectedChapter,
  onSelectChapter,
  bookMetrics,
  bookComprehension,
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
      </div>
    );
  }
  if (!chapters || chapters.length === 0) return null;

  const currentCh =
    selectedChapter === "all"
      ? chapters[0]
      : chapters.find((c) => c.chapter_index === selectedChapter) || chapters[0];
  const isEpisode = /^\d+x\d+/i.test(chapters[0]?.chapter_title || "");
  const unitUpper = isEpisode ? "EPISODE" : "CHAPTER";
  const unitShort = isEpisode ? "EP" : "CH";
  const maxTokens = Math.max(...chapters.map((c) => c.total_tokens || 1), 2000);
  const hasUserFlow = chapters.some((c) => c.user_comprehension !== undefined);

  return (
    <div className="border border-[#E2E2DF] bg-[#F8F8F6] p-4 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-[#111111] font-semibold">
          {unitUpper} PACING & DUAL COVERAGE ({chapters.length} {unitUpper}S)
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#555555]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-white border border-[#111111]" />
            Outline = {isEpisode ? "Episode" : "Chapter"} Length
          </span>
          {hasUserFlow && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-[#111111]" />
                Ink = Known %
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-[#B8FF01] border border-[#111111]" />
                Volt Cap = Learning %
              </span>
            </>
          )}
        </div>
      </div>

      <ScrollFadeX className="pb-2" fadeFromClassName="from-[#F8F8F6]">
        <div className="flex w-max items-stretch gap-2">
        <button
          type="button"
          onClick={() => onSelectChapter("all")}
          className={`w-20 shrink-0 border p-2.5 flex flex-col justify-between text-left transition-all cursor-pointer ${
            selectedChapter === "all" ? "border-[#111111] bg-[#B8FF01]" : "border-[#E2E2DF] bg-white hover:border-[#111111]"
          }`}
        >
          <span className="font-mono text-[10px] font-bold">ALL</span>
          <span className="font-mono text-xs font-bold leading-tight">{isEpisode ? "Full Season" : "Full Book"}</span>
          <span className="font-mono text-[10px] text-[#555555]">{chapters.length} {unitShort.toLowerCase()}</span>
        </button>

        {chapters.map((ch) => {
          const active = selectedChapter === ch.chapter_index;
          const lengthHeightPct = Math.min(100, Math.max(22, Math.round(((ch.total_tokens || 0) / maxTokens) * 100)));
          const chFlow = ch.user_comprehension?.text_coverage_percentage ?? ch.user_comprehension?.chapter_comprehension_percentage ?? null;
          const chLearn = ch.user_comprehension?.learning_text_coverage_percentage ?? ch.user_comprehension?.learning_percentage ?? 0;
          const knownFillPct = chFlow !== null ? Math.min(100, Math.max(0, chFlow)) : 100;
          const learnFillPct = chFlow !== null ? Math.min(100 - knownFillPct, Math.max(0, chLearn)) : 0;

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChapter(active ? "all" : ch.chapter_index)}
              title={`${ch.chapter_title} (${formatNumber(ch.total_tokens)} words${chFlow !== null ? ` · ${chFlow.toFixed(1)}% known + ${chLearn.toFixed(1)}% learning` : ""})`}
              className={`w-24 shrink-0 border p-2.5 text-left transition-all cursor-pointer ${
                active ? "border-[#111111] bg-[#EAEAE5] shadow-[2px_2px_0px_#111111]" : "border-[#E2E2DF] bg-white hover:border-[#111111]"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className={`font-bold ${active ? "bg-[#B8FF01] px-1 border border-[#111111]" : ""}`}>{unitShort}.{ch.chapter_index}</span>
                <span>{ch.cefr_level || "B1"}</span>
              </div>
              <div className="h-11 flex items-end mt-2 mb-1.5 border-b border-[#111111] px-1">
                <div
                  className="w-full bg-white border border-b-0 border-[#111111] flex flex-col justify-end overflow-hidden transition-all"
                  style={{ height: `${lengthHeightPct}%` }}
                >
                  {learnFillPct > 0 && (
                    <div className="w-full bg-[#B8FF01] border-t border-[#111111]/40 transition-all" style={{ height: `${Math.max(learnFillPct, 4)}%` }} />
                  )}
                  <div className="w-full bg-[#111111] transition-all" style={{ height: `${knownFillPct}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] tabular-nums">
                <span className="font-semibold text-[#111111]">
                  {chFlow !== null ? `${Math.round(chFlow)}%` : formatCompactWords(ch.total_tokens).replace(" words", "")}
                </span>
                <span className="text-[#666666]">
                  {chLearn > 0 ? formatLearningDelta(chLearn) : chFlow !== null ? formatCompactWords(ch.total_tokens).replace(" words", "") : "tok"}
                </span>
              </div>
            </button>
          );
        })}
        </div>
      </ScrollFadeX>

      <ChapterPacingSummary
        isEpisode={isEpisode}
        selectedChapter={selectedChapter}
        currentCh={currentCh}
        bookMetrics={bookMetrics}
        bookComprehension={bookComprehension}
      />
    </div>
  );
};
