import React, { useState } from "react";
import { Bookmark, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatProficiencyLevel } from "@/lib/proficiencyScale";
import { resolveCoverArt } from "@/lib/coverArt";
import { formatCompactWords } from "@/lib/formatters";
import type { MediaCatalogItem } from "@/types/media.types";

interface CatalogueMosaicTileProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  isAuthenticated: boolean;
  onToggleSave: (id: string) => void;
}

export const CatalogueMosaicTile: React.FC<CatalogueMosaicTileProps> = ({
  item,
  isSaved,
  isAuthenticated,
  onToggleSave,
}) => {
  const [imgErr, setImgErr] = useState(false);
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;
  const flowPct = item.comprehension?.text_coverage_percentage ?? item.comprehension?.comprehension_percentage ?? 0;
  const coverMeta = resolveCoverArt(targetTitle || englishTitle, item.cover_image_url);
  const showFallback = !coverMeta.coverUrl || imgErr;

  return (
    <Link
      to={`/media/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      <div
        className="relative aspect-[3/4] w-full overflow-hidden flex flex-col justify-between p-3 select-none"
        style={{ background: showFallback ? coverMeta.coverGradient : "#F1F5F9" }}
      >
        {!showFallback && (
          <img
            src={coverMeta.coverUrl!}
            alt={targetTitle || englishTitle}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        )}

        <div className="relative z-10 flex items-start justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm shadow-sm ${getCefrBadgeClass(level)}`}>
              {formatProficiencyLevel(level, item.language)}
            </span>
            {item.has_audio && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-xs" title="Audio available">
                <Headphones className="h-3 w-3" />
              </span>
            )}
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(item.id);
              }}
              aria-label={isSaved ? "Remove bookmark" : "Save bookmark"}
              className={`rounded-full p-1.5 backdrop-blur-xs transition cursor-pointer ${
                isSaved ? "bg-indigo-600 text-white" : "bg-white/90 text-slate-500 hover:text-slate-900"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {showFallback && (
          <div className="relative z-10">
            <div className="font-serif text-base font-medium leading-tight text-white line-clamp-3">
              {targetTitle || englishTitle}
            </div>
            <div className="mt-1 text-[11px] text-white/75 truncate">{item.creator}</div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {englishTitle}
          </h3>
          {targetTitle && <p className="truncate text-xs text-slate-500 mt-0.5">{targetTitle}</p>}
          <p className="truncate text-[11px] text-slate-400 mt-0.5">{item.creator}</p>
        </div>

        <div className="space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900 tabular-nums">{Math.round(flowPct)}% match</span>
                <span className="text-slate-400">{formatCompactWords(m?.total_tokens || 0)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-800" style={{ width: `${Math.min(100, flowPct)}%` }} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="uppercase">{item.language}</span>
              <span>{formatCompactWords(m?.total_tokens || 0)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
