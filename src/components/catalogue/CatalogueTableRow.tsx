import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import { CoverageGate } from "@/components/ui/CoverageGate";
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
  const flowPct =
    item.comprehension?.text_coverage_percentage ??
    item.comprehension?.comprehension_percentage ??
    0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;
  const flowTitle =
    learnFlowPct > 0
      ? `${flowPct.toFixed(1)}% known + ${learnFlowPct.toFixed(1)}% learning`
      : `${flowPct.toFixed(1)}% known`;
  const tone = isExpanded ? "bg-[#B8FF01] text-[#111111]" : "hover:bg-[#F8F8F6]";

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
        className={`hidden cursor-pointer grid-cols-12 items-center gap-3 px-3.5 py-3.5 transition-colors md:grid ${tone}`}
      >
        <div className="col-span-4 flex items-center gap-3 pr-2">
          <BookCoverPlate
            title={item.work_title || item.title}
            explicitUrl={item.cover_image_url}
            level={level}
            size="mini"
          />
          <div className="min-w-0">
            <Link
              to={item.work_id ? `/work/${item.work_id}` : `/media/${item.id}`}
              onClick={(event) => event.stopPropagation()}
              className="block truncate text-sm font-semibold leading-snug text-[#111111] hover:underline"
            >
              {item.work_title || item.title}
            </Link>
            <div className={`mt-0.5 truncate font-mono text-xs ${isExpanded ? "text-[#333333]" : "text-[#777777]"}`}>
              {item.title} · {item.language.toUpperCase()}
              {item.editions && item.editions.length > 1 ? ` · ${item.editions.length} editions` : ""}
            </div>
            <div className={`mt-0.5 font-mono text-xs ${isExpanded ? "text-[#333333]" : "text-[#777777]"}`}>
              {getMediaSubtypeLabel(item)}
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <span className="inline-block border border-[#111111] bg-transparent px-1.5 py-0.5 font-mono text-xs font-medium">
            {level}
          </span>
        </div>

        <div className="col-span-2 font-mono text-xs tabular-nums">
          {formatCompactWords(m?.total_tokens || 0)}
        </div>

        <div className="col-span-2 truncate text-xs">{item.creator}</div>

        <div className="col-span-2 flex items-center gap-2.5" title={flowTitle}>
          {isAuthenticated ? (
            <>
              <div className="w-24">
                <CatalogueFlowBar flowPct={flowPct} learnFlowPct={learnFlowPct} />
              </div>
              <span className="font-mono text-xs font-medium tabular-nums">
                {Math.round(flowPct)}%
              </span>
            </>
          ) : (
            <CoverageGate onSignIn={onRequireAuth} label="Sign in for coverage" />
          )}
        </div>

        <div
          className={`col-span-1 text-right font-mono text-xs ${
            isExpanded ? "text-[#222222]" : "text-[#666666]"
          }`}
        >
          F-H {fh}
        </div>
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
