import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type {
  MediaCatalogItem,
  MediaComprehensionStats,
} from "@/types/media.types";

interface InspectorSpecHeaderProps {
  item: MediaCatalogItem;
  comprehension: MediaComprehensionStats | null;
}

export const InspectorSpecHeader: React.FC<InspectorSpecHeaderProps> = ({
  item,
  comprehension,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = (m?.readability_score || 70).toFixed(1);
  const dialPct = ((m?.dialogue_ratio || 0) * 100).toFixed(1);

  const flowPct = Math.round(
    comprehension?.text_coverage_percentage ??
      comprehension?.comprehension_percentage ??
      0
  );
  const vocabPct = Math.round(comprehension?.comprehension_percentage ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-3">
        <Link
          to="/"
          className="font-mono text-xs text-[#111111] hover:underline flex items-center gap-1.5"
        >
          ← Back to Catalogue
        </Link>
        <span className="font-mono text-xs text-[#666666]">
          MEDIA ID: {item.id.slice(0, 8).toUpperCase()} · CHECKSUM VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-12 gap-6 border border-[#111111] p-5 bg-white items-start">
        <div className="col-span-12 lg:col-span-7 flex gap-5 items-start">
          <BookCoverPlate
            title={item.title}
            explicitUrl={item.cover_image_url}
            level={level}
            size="hero"
          />
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-[#B8FF01] text-[#111111] px-2 py-0.5 font-bold">
                {level}
              </span>
              <span className="text-[#666666]">{getMediaSubtypeLabel(item)}</span>
              <span>·</span>
              <span className="text-[#111111]">{item.creator}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              {item.title}
            </h1>
            <p className="font-serif text-sm text-[#333333] italic pt-1">
              {item.sampleSnippet}
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4 lg:border-l border-[#E2E2DF] lg:pl-6">
          <div>
            <div className="font-mono text-xs text-[#666666] uppercase">
              01 / READING FLOW
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums mt-1">
              {flowPct}%
            </div>
            <div className="w-full h-2 border border-[#111111] bg-white mt-2">
              <div
                className="h-full bg-[#111111] transition-all duration-200"
                style={{ width: `${flowPct}%` }}
              />
            </div>
            <div className="font-mono text-xs text-[#666666] mt-1.5">
              {formatCompactWords(m?.total_tokens || 0)} total
            </div>
          </div>

          <div>
            <div className="font-mono text-xs text-[#666666] uppercase">
              02 / VOCAB MASTERY
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums mt-1">
              {vocabPct}%
            </div>
            <div className="w-full h-2 border border-[#111111] bg-white mt-2">
              <div
                className="h-full bg-[#B8FF01] transition-all duration-200"
                style={{ width: `${vocabPct}%` }}
              />
            </div>
            <div className="font-mono text-xs text-[#666666] mt-1.5">
              F-H {fh} · Dial {dialPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
