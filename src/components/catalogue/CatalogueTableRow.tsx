import React from "react";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { InlinePreviewDrawer } from "./InlinePreviewDrawer";

interface CatalogueTableRowProps {
  item: MediaCatalogItem;
  isExpanded: boolean;
  isSaved: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueTableRow: React.FC<CatalogueTableRowProps> = ({
  item,
  isExpanded,
  isSaved,
  statusMap,
  onToggleExpand,
  onToggleSave,
  onToggleWord,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = Math.round(m?.readability_score || 70);
  const flowPct =
    item.comprehension?.text_coverage_percentage ??
    item.comprehension?.comprehension_percentage ??
    0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;

  return (
    <div>
      <div
        onClick={() => onToggleExpand(item.id)}
        className={`grid grid-cols-12 gap-3 px-3.5 py-3.5 items-center cursor-pointer transition-colors ${
          isExpanded ? "bg-[#B8FF01] text-[#111111]" : "hover:bg-[#F8F8F6]"
        }`}
      >
        <div className="col-span-4 pr-2 flex items-center gap-3">
          <BookCoverPlate
            title={item.title}
            explicitUrl={item.cover_image_url}
            level={level}
            size="mini"
          />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[#111111] leading-snug truncate">
              {item.title}
            </div>
            <div
              className={`font-mono text-xs mt-0.5 ${
                isExpanded ? "text-[#333333]" : "text-[#777777]"
              }`}
            >
              {getMediaSubtypeLabel(item)}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <span className="inline-block px-1.5 py-0.5 border border-[#111111] font-mono text-xs font-medium bg-transparent">
            {level}
          </span>
        </div>

        <div className="col-span-2 font-mono text-xs tabular-nums">
          {formatCompactWords(m?.total_tokens || 0)}
        </div>

        <div className="col-span-2 text-xs truncate">{item.creator}</div>

        <div className="col-span-2 flex items-center gap-2.5" title={learnFlowPct > 0 ? `${flowPct.toFixed(1)}% known + ${learnFlowPct.toFixed(1)}% learning` : `${flowPct.toFixed(1)}% known`}>
          <div className="w-24 h-2 border border-[#111111] bg-white overflow-hidden flex">
            <div className="h-full bg-[#111111] transition-all duration-200" style={{ width: `${Math.min(100, flowPct)}%` }} />
            {learnFlowPct > 0 && (
              <div className="h-full bg-[#B8FF01] border-l border-[#111111]/40 transition-all duration-200" style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 3))}%` }} />
            )}
          </div>
          <span className="font-mono text-xs font-medium tabular-nums">
            {Math.round(flowPct)}%
          </span>
        </div>

        <div
          className={`col-span-1 font-mono text-xs text-right ${
            isExpanded ? "text-[#222222]" : "text-[#666666]"
          }`}
        >
          F-H {fh}
        </div>
      </div>

      {isExpanded && (
        <InlinePreviewDrawer
          item={item}
          isSaved={isSaved}
          statusMap={statusMap}
          onToggleSave={onToggleSave}
          onToggleWord={onToggleWord}
        />
      )}
    </div>
  );
};
