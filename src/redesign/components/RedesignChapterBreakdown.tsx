import React from "react";
import { formatCompactWords, formatPercent } from "@/lib/formatters";
import { getCefrBadgeClass } from "@/redesign/lib/displayHelpers";
import type { MediaChapterMetrics } from "@/types/media.types";

interface RedesignChapterBreakdownProps {
  chapters: MediaChapterMetrics[];
  selectedChapter: number | "all";
  onSelectChapter: (ch: number | "all") => void;
}

export const RedesignChapterBreakdown: React.FC<RedesignChapterBreakdownProps> = ({
  chapters,
  selectedChapter,
  onSelectChapter,
}) => {
  if (!chapters.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
        No chapter breakdown metrics indexed for this title yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((ch) => {
        const active = selectedChapter === ch.chapter_index;
        const comp = ch.user_comprehension;
        const flowPct = comp?.text_coverage_percentage ?? 0;
        const learnPct = comp?.learning_text_coverage_percentage ?? 0;
        const newWords = comp?.new_words_count ?? ch.unique_words_count;
        const knownNew = comp?.known_new_words ?? 0;

        return (
          <div
            key={ch.id}
            onClick={() => onSelectChapter(active ? "all" : ch.chapter_index)}
            className={`rounded-2xl border p-4 cursor-pointer transition ${
              active
                ? "border-indigo-400 bg-indigo-50/35 ring-2 ring-indigo-100 shadow-xs"
                : "border-slate-200/80 bg-white shadow-xs hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    #{ch.chapter_index}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {ch.chapter_title}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(ch.cefr_level || "B1")}`}>
                    {ch.cefr_level || "B1"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{formatCompactWords(ch.total_tokens)}</span>
                  <span>{ch.unique_words_count} unique lemmas</span>
                  <span>
                    +{newWords} introduced ({knownNew} known)
                  </span>
                  <span>{formatPercent(ch.dialogue_ratio, 0)} dialogue</span>
                  {ch.readability_score ? (
                    <span>Readability {Math.round(ch.readability_score)}</span>
                  ) : null}
                </div>
              </div>

              <div className="w-full md:w-56 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Match</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    {flowPct.toFixed(1)}% known
                    {learnPct > 0 ? ` · +${learnPct.toFixed(1)}%` : ""}
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, flowPct)}%` }}
                  />
                  {learnPct > 0 && (
                    <div
                      className="h-full bg-amber-300"
                      style={{ width: `${Math.min(100 - flowPct, Math.max(learnPct, 2))}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
