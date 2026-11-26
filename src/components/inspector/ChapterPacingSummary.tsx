import React from "react";
import { formatLearningDelta, formatNumber, formatPercent } from "@/lib/formatters";
import type {
  MediaChapterMetrics,
  MediaComprehensionStats,
  MediaMetrics,
} from "@/types/media.types";

interface ChapterPacingSummaryProps {
  isEpisode: boolean;
  selectedChapter: number | "all";
  currentCh: MediaChapterMetrics;
  bookMetrics?: MediaMetrics | null;
  bookComprehension?: MediaComprehensionStats | null;
}

/** Footer summary for either the full-book tile or the selected chapter. */
export const ChapterPacingSummary: React.FC<ChapterPacingSummaryProps> = ({
  isEpisode,
  selectedChapter,
  currentCh,
  bookMetrics,
  bookComprehension,
}) => {
  const isAll = selectedChapter === "all";
  const flowPct = isAll
    ? bookComprehension?.text_coverage_percentage ??
      bookComprehension?.comprehension_percentage ??
      null
    : currentCh.user_comprehension?.text_coverage_percentage ??
      currentCh.user_comprehension?.chapter_comprehension_percentage ??
      null;
  const learnFlowPct = isAll
    ? bookComprehension?.learning_text_coverage_percentage ??
      bookComprehension?.learning_percentage ??
      0
    : currentCh.user_comprehension?.learning_text_coverage_percentage ?? 0;
  const title = isAll
    ? isEpisode
      ? "Full Season"
      : "Full Book"
    : `${isEpisode ? "" : `Chapter ${currentCh.chapter_index}: `}${currentCh.chapter_title}`;
  const totalTokens = isAll
    ? bookMetrics?.total_tokens ?? currentCh.total_tokens
    : currentCh.total_tokens;
  const uniqueWords = isAll
    ? bookMetrics?.unique_words_count ?? currentCh.unique_words_count
    : currentCh.unique_words_count;
  const readability = isAll
    ? bookMetrics?.readability_score
    : currentCh.readability_score;
  const dialogue = isAll ? bookMetrics?.dialogue_ratio : currentCh.dialogue_ratio;

  return (
    <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
      <div>
        <span className="font-semibold text-slate-900">{title}</span>
        <span className="text-slate-400 ml-2">
          · {formatNumber(totalTokens)} tokens · {formatNumber(uniqueWords)} lemmas
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 tabular-nums">
        <span>
          Readability: <strong className="text-slate-900">{readability != null ? readability.toFixed(1) : "—"}</strong>
        </span>
        <span>
          Dialogue: <strong className="text-slate-900">{formatPercent(dialogue, 1)}</strong>
        </span>
        {flowPct !== null && (
          <span>
            Flow: <strong className="text-emerald-700">{flowPct.toFixed(1)}%</strong>
            {learnFlowPct > 0 ? <span className="ml-1 text-sky-700">({formatLearningDelta(learnFlowPct)} learning)</span> : ""}
          </span>
        )}
      </div>
    </div>
  );
};
