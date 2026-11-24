import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { CoverageGate } from "@/components/ui/CoverageGate";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatProficiencyLevel } from "@/lib/proficiencyScale";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem } from "@/types/media.types";
import { CatalogueFlowBar } from "./CatalogueFlowBar";

interface CatalogueTableCardProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onToggleSave: (id: string) => void;
}

export const CatalogueTableCard: React.FC<CatalogueTableCardProps> = ({
  item,
  isSaved,
  isAuthenticated,
  onRequireAuth,
  onToggleSave,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = Math.round(m?.readability_score || 70);
  const flowPct = item.comprehension?.text_coverage_percentage ?? item.comprehension?.comprehension_percentage ?? 0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;

  return (
    <div className="px-4 py-3.5 md:hidden">
      <div className="flex items-start gap-3">
        <BookCoverPlate
          title={targetTitle || englishTitle}
          explicitUrl={item.cover_image_url}
          level={level}
          size="mini"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">{englishTitle}</div>
          {targetTitle && <div className="truncate text-xs text-slate-600">{targetTitle}</div>}
          <div className="mt-0.5 text-[11px] text-slate-400">
            {item.creator} · {item.language.toUpperCase()} · {getMediaSubtypeLabel(item)}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${getCefrBadgeClass(level)}`}>{formatProficiencyLevel(level, item.language)}</span>
            <span>{formatCompactWords(m?.total_tokens || 0)}</span>
            <span>F-H {fh}</span>
            {isAuthenticated && <span className="font-semibold text-emerald-700">{Math.round(flowPct)}% known</span>}
          </div>

          <div className="mt-2">
            {isAuthenticated ? (
              <CatalogueFlowBar flowPct={flowPct} learnFlowPct={learnFlowPct} />
            ) : (
              <CoverageGate onSignIn={onRequireAuth} label="Sign in to see match" />
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(item.id)}
              className={`inline-flex h-8 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 text-xs font-medium cursor-pointer transition ${
                isSaved ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </button>
            <Link
              to={`/media/${item.id}`}
              className="inline-flex h-8 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-slate-900 px-3 text-center text-xs font-medium text-white hover:bg-indigo-600"
            >
              Inspect Vocab →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
