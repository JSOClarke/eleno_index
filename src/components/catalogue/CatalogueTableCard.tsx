import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem } from "@/types/media.types";
import { CatalogueFlowBar } from "./CatalogueFlowBar";

interface CatalogueTableCardProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

/**
 * Phone layout for a catalogue table row. Deliberately has no expand/accordion:
 * Save and Open are one tap each, with no parent click handler competing.
 */
export const CatalogueTableCard: React.FC<CatalogueTableCardProps> = ({
  item,
  isSaved,
  onToggleSave,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = Math.round(m?.readability_score || 70);
  const flowPct =
    item.comprehension?.text_coverage_percentage ??
    item.comprehension?.comprehension_percentage ??
    0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;
  const flowTitle =
    learnFlowPct > 0
      ? `${flowPct.toFixed(1)}% known + ${learnFlowPct.toFixed(1)}% learning`
      : `${flowPct.toFixed(1)}% known`;

  return (
    <div className="px-3.5 py-3 md:hidden">
      <div className="flex items-start gap-3">
        <BookCoverPlate
          title={item.title}
          explicitUrl={item.cover_image_url}
          level={level}
          size="mini"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-snug text-[#111111]">
            {item.title}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-[#777777]">
            {getMediaSubtypeLabel(item)}
          </div>
          <div className="truncate font-mono text-[11px] text-[#555555]">{item.creator}</div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
            <span className="border border-[#111111] bg-white px-1.5 py-0.5">{level}</span>
            <span>{formatCompactWords(m?.total_tokens || 0)}</span>
            <span>F-H {fh}</span>
            <span className="font-semibold">{Math.round(flowPct)}% known</span>
          </div>

          <div className="mt-1.5" title={flowTitle}>
            <CatalogueFlowBar flowPct={flowPct} learnFlowPct={learnFlowPct} />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(item.id)}
              aria-pressed={isSaved}
              className={`flex-1 border border-[#111111] px-2 py-1.5 font-mono text-xs font-bold cursor-pointer ${
                isSaved
                  ? "bg-[#111111] text-[#B8FF01]"
                  : "bg-white text-[#111111]"
              }`}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </button>
            <Link
              to={`/media/${item.id}`}
              className="flex-1 border border-[#111111] bg-[#B8FF01] px-2 py-1.5 text-center font-mono text-xs font-bold text-[#111111]"
            >
              Open →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
