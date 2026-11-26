import React from "react";
import { Bookmark, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCompactWords, formatPercent, getMediaSubtypeLabel } from "@/lib/formatters";
import { getCefrBadgeClass, getPlatformLinks } from "@/redesign/lib/displayHelpers";
import type { MediaCatalogItem } from "@/types/media.types";
import { RedesignCoverArt } from "./RedesignCoverArt";

interface RedesignMediaCardProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export const RedesignMediaCard: React.FC<RedesignMediaCardProps> = ({
  item,
  isSaved,
  onToggleSave,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "";
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;
  const synopsis = item.work_synopsis || item.sampleSnippet;
  const flowPct = item.comprehension?.text_coverage_percentage ?? 0;
  const wpm = m?.words_per_minute ? Math.round(m.words_per_minute) : null;
  const dialLabel = wpm ? `${wpm} WPM` : `${formatPercent(m?.dialogue_ratio, 0)} dialogue`;
  const whereTo = getPlatformLinks(item);

  return (
    <article className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <RedesignCoverArt
        title={targetTitle || englishTitle}
        creator={item.creator}
        explicitUrl={item.cover_image_url}
        badgeLabel={getMediaSubtypeLabel(item)}
      />

      <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/preview/media/${item.id}`}
                className="block text-lg font-semibold tracking-tight text-slate-900 leading-snug hover:text-indigo-700 transition-colors"
              >
                {englishTitle}
              </Link>
              {targetTitle && (
                <div className="mt-0.5 text-xs font-medium text-slate-600">{targetTitle}</div>
              )}
              <div className="mt-0.5 text-xs text-slate-400">{item.creator}</div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                {item.language}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCefrBadgeClass(level)}`}>
                {level}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Vocabulary Match</span>
              <span className="font-semibold tabular-nums text-emerald-700">
                {Math.round(flowPct)}% known
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, flowPct)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {formatCompactWords(m?.total_tokens || 0)} · {dialLabel} · {m?.unique_words_count || 0} unique
            </p>
          </div>

          {synopsis && (
            <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">{synopsis}</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-slate-400">{whereTo.label}</span>
            {whereTo.platforms.map((p) => (
              <span key={p} className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {p}
              </span>
            ))}
            {item.has_audio && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                <Headphones className="h-3 w-3" /> Audio
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSave(item.id)}
              title={isSaved ? "Saved" : "Save"}
              className={`rounded-xl p-2 transition cursor-pointer ${
                isSaved ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <Link
              to={`/preview/media/${item.id}`}
              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-indigo-600"
            >
              Inspect Vocab →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
