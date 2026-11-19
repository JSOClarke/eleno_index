import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { CoverageGate } from "@/components/ui/CoverageGate";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { CatalogueFlowBar } from "./CatalogueFlowBar";
import { CatalogueTableCard } from "./CatalogueTableCard";
import { InlinePreviewDrawer } from "./InlinePreviewDrawer";

interface CatalogueTableRowProps {
  item: MediaCatalogItem;
  isExpanded: boolean;
  isSaved: boolean;
  statusMap: Record<string, UserVocabStatus>;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueTableRow: React.FC<CatalogueTableRowProps> = ({
  item,
  isExpanded,
  isSaved,
  statusMap,
  isAuthenticated,
  onRequireAuth,
  onToggleExpand,
  onToggleSave,
  onToggleWord,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = Math.round(m?.readability_score || 70);
  const flowPct = item.comprehension?.text_coverage_percentage ?? item.comprehension?.comprehension_percentage ?? 0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;

  return (
    <div>
      <CatalogueTableCard
        item={item}
        isSaved={isSaved}
        isAuthenticated={isAuthenticated}
        onRequireAuth={onRequireAuth}
        onToggleSave={onToggleSave}
      />

      <div
        onClick={() => onToggleExpand(item.id)}
        className={`hidden cursor-pointer grid-cols-12 items-center gap-3 px-4 py-3.5 transition-colors md:grid ${
          isExpanded ? "bg-indigo-50/40" : "hover:bg-slate-50/80"
        }`}
      >
        <div className="col-span-4 flex items-center gap-3 pr-2 min-w-0">
          <BookCoverPlate
            title={targetTitle || englishTitle}
            explicitUrl={item.cover_image_url}
            level={level}
            size="mini"
          />
          <div className="min-w-0">
            <Link
              to={`/media/${item.id}`}
              onClick={(event) => event.stopPropagation()}
              className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-700"
            >
              {englishTitle}
            </Link>
            {targetTitle && (
              <div className="truncate text-xs text-slate-600">{targetTitle}</div>
            )}
            <div className="mt-0.5 text-[11px] text-slate-400">
              {item.language.toUpperCase()} · {getMediaSubtypeLabel(item)}
              {item.work_language && item.work_language.toLowerCase() === item.language.toLowerCase() && (
                <span title="Originally written in this language" className="ml-1.5 rounded bg-slate-900 px-1.5 py-0.2 text-[9px] font-semibold uppercase text-white">
                  Native
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getCefrBadgeClass(level)}`}>
            {level}
          </span>
          {item.has_audio && <span title="Audio narration available" className="text-xs">🎧</span>}
        </div>

        <div className="col-span-2 text-xs text-slate-600 tabular-nums">
          {formatCompactWords(m?.total_tokens || 0)}
        </div>

        <div className="col-span-2 truncate text-xs text-slate-500">{item.creator}</div>

        <div className="col-span-2 flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <div className="w-20">
                <CatalogueFlowBar flowPct={flowPct} learnFlowPct={learnFlowPct} />
              </div>
              <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                {Math.round(flowPct)}%
              </span>
            </>
          ) : (
            <CoverageGate onSignIn={onRequireAuth} label="Sign in" />
          )}
        </div>

        <div className="col-span-1 text-right text-xs text-slate-500 tabular-nums">F-H {fh}</div>
      </div>

      {isExpanded && (
        <div className="hidden md:block">
          <InlinePreviewDrawer
            item={item}
            isSaved={isSaved}
            statusMap={statusMap}
            onToggleSave={onToggleSave}
            onToggleWord={onToggleWord}
          />
        </div>
      )}
    </div>
  );
};
