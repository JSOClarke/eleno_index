import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import {
  formatCompactWords,
  formatLearningDelta,
  formatPercent,
  getMediaSubtypeLabel,
} from "@/lib/formatters";
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
  const wpm = m?.words_per_minute ? Math.round(m.words_per_minute) : null;
  const dialOrWpm = wpm ? `${wpm} WPM` : `Dial ${formatPercent(m?.dialogue_ratio, 1)}`;

  const flowPct = comprehension?.text_coverage_percentage ?? comprehension?.comprehension_percentage ?? 0;
  const learnFlowPct = comprehension?.learning_text_coverage_percentage ?? 0;
  const vocabPct = comprehension?.comprehension_percentage ?? 0;
  const learnVocabPct = comprehension?.learning_percentage ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-3">
        <Link
          to="/"
          className="font-mono text-xs text-[#111111] hover:underline flex items-center gap-1.5"
        >
          ← Back to Catalogue
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={`/read/${item.id}`}
            className="rounded bg-[#B8FF01] border border-[#111111] px-3 py-1 font-mono text-xs font-bold text-[#111111] shadow-sm transition hover:bg-[#a6e600]"
          >
            Read Story →
          </Link>
          <span className="hidden font-mono text-xs text-[#666666] sm:inline">
            MEDIA ID: {item.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
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
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums">{Math.round(flowPct)}%</span>
              {learnFlowPct > 0 && (
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-[#B8FF01] border border-[#111111]">
                  {formatLearningDelta(learnFlowPct)} learn
                </span>
              )}
            </div>
            <div className="w-full h-2.5 border border-[#111111] bg-white mt-2 flex overflow-hidden">
              <div className="h-full bg-[#111111] transition-all duration-200" style={{ width: `${Math.min(100, flowPct)}%` }} />
              {learnFlowPct > 0 && (
                <div className="h-full bg-[#B8FF01] border-l border-[#111111]/40 transition-all duration-200" style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 1.5))}%` }} />
              )}
            </div>
            <div className="font-mono text-xs text-[#666666] mt-1.5">
              {formatCompactWords(m?.total_tokens || 0)} total
            </div>
          </div>

          <div>
            <div className="font-mono text-xs text-[#666666] uppercase">
              02 / VOCAB MASTERY
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums">{Math.round(vocabPct)}%</span>
              {learnVocabPct > 0 && (
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-[#B8FF01] border border-[#111111]">
                  {formatLearningDelta(learnVocabPct)} learn
                </span>
              )}
            </div>
            <div className="w-full h-2.5 border border-[#111111] bg-white mt-2 flex overflow-hidden">
              <div className="h-full bg-[#111111] transition-all duration-200" style={{ width: `${Math.min(100, vocabPct)}%` }} />
              {learnVocabPct > 0 && (
                <div className="h-full bg-[#B8FF01] border-l border-[#111111]/40 transition-all duration-200" style={{ width: `${Math.min(100 - vocabPct, Math.max(learnVocabPct, 1.5))}%` }} />
              )}
            </div>
            <div className="font-mono text-xs text-[#666666] mt-1.5">
              F-H {fh} · {dialOrWpm}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
