import React from "react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatCompactWords, formatLearningDelta, formatNumber } from "@/lib/formatters";
import type { MediaChapterMetrics, MediaComprehensionStats, MediaMetrics } from "@/types/media.types";
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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
        <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 animate-pulse" />
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
  const unitLabel = isEpisode ? "Episode" : "Chapter";
  const unitShort = isEpisode ? "Ep" : "Ch";
  const maxTokens = Math.max(...chapters.map((c) => c.total_tokens || 1), 2000);
  const hasUserFlow = chapters.some((c) => c.user_comprehension !== undefined);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">
          {unitLabel} Breakdown ({chapters.length})
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            {unitLabel} Length
          </span>
          {hasUserFlow && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Known %
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Learning %
              </span>
            </>
          )}
        </div>
      </div>

      <ScrollFadeX fadeFromClassName="from-white" arrows arrowClassName="bg-white/95">
        <div className="flex w-max items-stretch gap-2 py-1.5 px-0.5">
          <button
            type="button"
            onClick={() => onSelectChapter("all")}
            className={`w-24 shrink-0 rounded-xl border p-2.5 flex flex-col justify-between text-left transition cursor-pointer ${
              selectedChapter === "all"
                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="text-[11px] font-medium opacity-75">All</span>
            <span className="text-xs font-semibold leading-tight">{isEpisode ? "Full Season" : "Full Book"}</span>
            <span className="text-[11px] opacity-75">{chapters.length} {unitShort.toLowerCase()}</span>
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
                className={`w-24 shrink-0 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                  active
                    ? "border-slate-800 bg-slate-50/80 -translate-y-0.5 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.18)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-800">{unitShort}.{ch.chapter_index}</span>
                  <span className={`rounded-full px-1.5 py-0.2 font-semibold ${getCefrBadgeClass(ch.cefr_level || "B1")}`}>
                    {ch.cefr_level || "B1"}
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  {chFlow !== null && (
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-[11px] tabular-nums">
                        <span className="font-semibold text-slate-900">{Math.round(chFlow)}%</span>
                        {chLearn > 0 && <span className="text-[10px] font-medium text-[#111111]">{formatLearningDelta(chLearn)}</span>}
                      </div>
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full transition-all ${learnFillPct > 0 ? "" : "rounded-r-full"} bg-emerald-500`} style={{ width: `${knownFillPct}%` }} />
                        {learnFillPct > 0 && <div className="h-full rounded-r-full bg-amber-300 transition-all" style={{ width: `${Math.max(learnFillPct, 3)}%` }} />}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] tabular-nums text-slate-400">
                      <span>{formatCompactWords(ch.total_tokens).replace(" words", "")}</span>
                      <span>words</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-400 transition-all" style={{ width: `${lengthHeightPct}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollFadeX>

      <ChapterPacingSummary isEpisode={isEpisode} selectedChapter={selectedChapter} currentCh={currentCh} bookMetrics={bookMetrics} bookComprehension={bookComprehension} />
    </section>
  );
};
