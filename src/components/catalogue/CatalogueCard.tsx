import React, { useState } from "react";
import { Bookmark, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { PlatformLinkPills } from "@/components/ui/PlatformLinkPills";
import { getCefrBadgeClass, getPlatformLinks } from "@/lib/catalogueDisplay";
import { formatProficiencyLevel } from "@/lib/proficiencyScale";
import { formatCompactWords, formatPercent, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { CardCoveragePanel } from "./CardCoveragePanel";
import { PreviewWordChips } from "./PreviewWordChips";
import { SeriesSiblingsStrip } from "./SeriesSiblingsStrip";

interface CatalogueCardProps {
  item: MediaCatalogItem;
  isSelected: boolean;
  isSaved: boolean;
  seriesSiblings?: MediaCatalogItem[];
  statusMap: Record<string, UserVocabStatus>;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onSelectCard: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({
  item, isSelected, isSaved, seriesSiblings, statusMap, isAuthenticated,
  onRequireAuth, onSelectCard, onToggleSave, onToggleWord,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "";
  const wpm = m?.words_per_minute ? Math.round(m.words_per_minute) : null;
  const dialOrSpeedLabel = wpm ? `${wpm} WPM` : `${formatPercent(m?.dialogue_ratio, 0)} dialogue`;
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;
  const synopsis = item.work_synopsis || item.sampleSnippet;
  const whereTo = getPlatformLinks(item);
  const subtype = getMediaSubtypeLabel(item);
  const isNative = Boolean(item.work_language && item.work_language.toLowerCase() === item.language.toLowerCase());
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  return (
    <article
      onClick={() => onSelectCard(item.id)}
      className={`group flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-white transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-indigo-400 ring-2 ring-indigo-100 shadow-md"
          : "border-slate-200/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <BookCoverPlate title={targetTitle || englishTitle} creator={`${item.creator} · ${subtype}`} explicitUrl={item.cover_image_url} level={level} size="showcase" badgeText={subtype} />

      <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/media/${item.id}`} onClick={(e) => e.stopPropagation()}
                className="block text-lg font-semibold tracking-tight text-slate-900 leading-snug hover:text-indigo-700 transition-colors">
                {englishTitle}
              </Link>
              {targetTitle && <div className="mt-0.5 text-xs font-medium text-slate-600">{targetTitle}</div>}
              <div className="mt-0.5 text-xs text-slate-400">
                {item.creator}
                {item.editions && item.editions.length > 1 && item.work_id && (
                  <Link to={`/work/${item.work_id}`} onClick={(e) => e.stopPropagation()} className="ml-2 text-indigo-600 hover:underline">
                    · {item.editions.length} editions
                  </Link>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {isNative && (
                <span title="Originally written in this language" className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Native
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                {item.language}
              </span>
              {level && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCefrBadgeClass(level)}`}>
                  {formatProficiencyLevel(level, item.language)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <CardCoveragePanel item={item} isAuthenticated={isAuthenticated} onRequireAuth={onRequireAuth} />
            <div className="text-xs text-slate-400">
              {formatCompactWords(m?.total_tokens || 0)} · {dialOrSpeedLabel} · {m?.unique_words_count || 0} unique
            </div>
          </div>

          {synopsis && (
            <div className="min-h-[58px]">
              <p className={`text-xs leading-relaxed text-slate-600 ${synopsisExpanded ? "" : "line-clamp-3"}`}>{synopsis}</p>
              {synopsis.length > 140 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setSynopsisExpanded((v) => !v); }}
                  className="mt-1 text-[11px] font-semibold text-slate-900 hover:underline cursor-pointer">
                  {synopsisExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          <div className="space-y-1.5 min-h-[68px]">
            <div className="text-[11px] font-medium text-slate-400">Most common words</div>
            {item.previewWords.length > 0 ? (
              <div className="max-h-[48px] overflow-hidden">
                <PreviewWordChips item={item} words={item.previewWords.slice(0, 5)} statusMap={statusMap} onToggleWord={onToggleWord} compact />
              </div>
            ) : (
              <div className="flex gap-1.5">
                {[1, 2, 3].map((n) => <span key={n} className="h-[22px] w-16 rounded-full bg-slate-100 animate-pulse" />)}
              </div>
            )}
          </div>

          <SeriesSiblingsStrip currentId={item.id} seriesName={item.series?.name || item.series_name} siblings={seriesSiblings} isAuthenticated={isAuthenticated} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
          <PlatformLinkPills
            label={whereTo.label}
            links={whereTo.links}
            extraSlot={
              item.has_audio ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                  <Headphones className="h-3 w-3" /> Audio
                </span>
              ) : undefined
            }
          />

          <div className="flex items-center gap-1.5">
            <button type="button" title={isSaved ? "Saved" : "Save"} onClick={(e) => { e.stopPropagation(); onToggleSave(item.id); }}
              className={`rounded-xl p-2 transition cursor-pointer ${isSaved ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}>
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <Link to={`/media/${item.id}`} onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-indigo-600">
              Inspect Vocab →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
