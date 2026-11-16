import React from "react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";
import { formatCompactWords, formatLearningDelta, formatNumber, formatPercent } from "@/lib/formatters";
import { getCefrBadgeClass } from "@/redesign/lib/displayHelpers";
import type {
  MediaChapterMetrics,
  MediaComprehensionStats,
  MediaMetrics,
} from "@/types/media.types";

interface RedesignChapterPacingProps {
  chapters: MediaChapterMetrics[];
  selectedChapter: number | "all";
  onSelectChapter: (ch: number | "all") => void;
  bookMetrics?: MediaMetrics | null;
  bookComprehension?: MediaComprehensionStats | null;
}

export const RedesignChapterPacing: React.FC<RedesignChapterPacingProps> = ({
  chapters,
  selectedChapter,
  onSelectChapter,
  bookMetrics,
  bookComprehension,
}) => {
  if (!chapters.length) return null;

  const isEpisode = /^\d+x\d+/i.test(chapters[0]?.chapter_title || "");
  const unitLabel = isEpisode ? "Episode" : "Chapter";
  const unitShort = isEpisode ? "Ep" : "Ch";
  const maxTokens = Math.max(...chapters.map((c) => c.total_tokens || 1), 1500);
  const currentCh =
    selectedChapter === "all"
      ? chapters[0]
      : chapters.find((c) => c.chapter_index === selectedChapter) || chapters[0];

  const isAll = selectedChapter === "all";
  const summaryTitle = isAll
    ? isEpisode
      ? "Full Season"
      : "Full Book"
    : `${isEpisode ? "" : `Chapter ${currentCh.chapter_index}: `}${currentCh.chapter_title}`;
  const sumTokens = isAll ? bookMetrics?.total_tokens ?? currentCh.total_tokens : currentCh.total_tokens;
  const sumUnique = isAll ? bookMetrics?.unique_words_count ?? currentCh.unique_words_count : currentCh.unique_words_count;
  const sumFh = isAll ? bookMetrics?.readability_score : currentCh.readability_score;
  const sumDial = isAll ? bookMetrics?.dialogue_ratio : currentCh.dialogue_ratio;
  const sumFlow = isAll
    ? bookComprehension?.text_coverage_percentage ?? bookComprehension?.comprehension_percentage ?? null
    : currentCh.user_comprehension?.text_coverage_percentage ?? null;
  const sumLearn = isAll
    ? bookComprehension?.learning_text_coverage_percentage ?? 0
    : currentCh.user_comprehension?.learning_text_coverage_percentage ?? 0;

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {unitLabel} Pacing & Dual Coverage ({chapters.length} {unitLabel}s)
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-300" /> Length
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Known %
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Learning %
          </span>
        </div>
      </div>

      <ScrollFadeX className="pb-1" fadeFromClassName="from-white" arrows arrowClassName="bg-white">
        <div className="flex w-max items-stretch gap-2">
          <button
            type="button"
            onClick={() => onSelectChapter("all")}
            className={`w-24 shrink-0 rounded-xl border p-2.5 flex flex-col justify-between text-left cursor-pointer transition ${
              isAll
                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase opacity-75">All</span>
            <span className="text-xs font-semibold leading-tight">
              {isEpisode ? "Full Season" : "Full Book"}
            </span>
            <span className="text-[11px] opacity-75">{chapters.length} {unitShort.toLowerCase()}</span>
          </button>

          {chapters.map((ch) => {
            const active = selectedChapter === ch.chapter_index;
            const heightPct = Math.min(100, Math.max(24, Math.round((ch.total_tokens / maxTokens) * 100)));
            const flow = ch.user_comprehension?.text_coverage_percentage ?? 0;
            const learn = ch.user_comprehension?.learning_text_coverage_percentage ?? 0;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChapter(active ? "all" : ch.chapter_index)}
                className={`w-24 shrink-0 rounded-xl border p-2.5 text-left cursor-pointer transition ${
                  active
                    ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-800">{unitShort}.{ch.chapter_index}</span>
                  <span className={`rounded-full px-1.5 py-0.2 font-semibold ${getCefrBadgeClass(ch.cefr_level || "B1")}`}>
                    {ch.cefr_level || "B1"}
                  </span>
                </div>
                <div className="mt-2 mb-1.5 flex h-11 items-end px-1">
                  <div className="flex w-full flex-col justify-end overflow-hidden rounded-md bg-slate-100" style={{ height: `${heightPct}%` }}>
                    {learn > 0 && <div className="w-full bg-amber-300" style={{ height: `${Math.max(learn, 6)}%` }} />}
                    <div className="w-full bg-emerald-500" style={{ height: `${flow}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] tabular-nums">
                  <span className="font-semibold text-slate-800">{Math.round(flow)}%</span>
                  <span className="text-slate-400">{formatCompactWords(ch.total_tokens)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollFadeX>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-900">{summaryTitle}</span>
          <span className="ml-2 text-slate-400">
            · {formatNumber(sumTokens)} tokens · {formatNumber(sumUnique)} lemmas
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 tabular-nums">
          <span>F-H: <strong className="text-slate-900">{(sumFh || 70).toFixed(1)}</strong></span>
          <span>Dialogue: <strong className="text-slate-900">{formatPercent(sumDial, 1)}</strong></span>
          {sumFlow !== null && (
            <span>
              Flow: <strong className="text-emerald-700">{sumFlow.toFixed(1)}%</strong>
              {sumLearn > 0 ? <span className="text-amber-700 ml-1">({formatLearningDelta(sumLearn)} learn)</span> : ""}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
