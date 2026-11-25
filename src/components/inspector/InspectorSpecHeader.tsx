import React, { useState } from "react";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { PlatformLinkPills } from "@/components/ui/PlatformLinkPills";
import { getCefrBadgeClass, getPlatformLinks } from "@/lib/catalogueDisplay";
import { formatProficiencyLevel } from "@/lib/proficiencyScale";
import { formatCompactWords, formatPercent } from "@/lib/formatters";
import type { MediaCatalogItem, MediaComprehensionStats } from "@/types/media.types";
import { InspectorFlowPanel } from "./InspectorFlowPanel";

interface InspectorSpecHeaderProps {
  item: MediaCatalogItem;
  comprehension: MediaComprehensionStats | null;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export const InspectorSpecHeader: React.FC<InspectorSpecHeaderProps> = ({
  item,
  comprehension,
  isAuthenticated,
  onRequireAuth,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "";
  const fh = m?.readability_score != null ? m.readability_score.toFixed(1) : "—";
  const wpm = m?.words_per_minute ? Math.round(m.words_per_minute) : null;
  const lang = (item.language || "").toLowerCase();
  const formulaShort = lang.startsWith("fr") ? "K-M" : lang.startsWith("ru") ? "Oborneva" : lang.startsWith("zh") ? "ZH" : "F-H";
  const dialOrWpm = wpm ? `${wpm} WPM` : `Dial ${formatPercent(m?.dialogue_ratio, 1)}`;

  const flowPct = comprehension?.text_coverage_percentage ?? comprehension?.comprehension_percentage ?? 0;
  const learnFlowPct = comprehension?.learning_text_coverage_percentage ?? 0;
  const vocabPct = comprehension?.comprehension_percentage ?? 0;
  const learnVocabPct = comprehension?.learning_percentage ?? 0;
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.work_title.trim().toLowerCase() !== item.title.trim().toLowerCase() ? item.title : null;
  const whereTo = getPlatformLinks(item);
  const synopsis = item.work_synopsis || item.sampleSnippet;
  const isNative = Boolean(item.work_language && item.work_language.toLowerCase() === item.language.toLowerCase());
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-12 gap-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm items-start">
        <div className="col-span-12 md:col-span-7 flex items-start gap-4 sm:gap-5">
          <BookCoverPlate title={targetTitle || englishTitle} explicitUrl={item.cover_image_url} level={level} size="hero" />
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {level && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCefrBadgeClass(level)}`}>{formatProficiencyLevel(level, item.language)}</span>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">{item.language}</span>
              {isNative && (
                <span title="Originally written in this language" className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Native
                </span>
              )}
              <span className="text-xs font-medium capitalize text-slate-400">
                {(item.type || "book").replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 leading-tight break-words">
              {englishTitle}
            </h1>
            {targetTitle && <div className="text-sm font-medium text-slate-600">{targetTitle}</div>}
            {(item.series?.name || item.series_name) && (
              <div className="text-xs font-medium text-indigo-600">
                {item.series?.name || item.series_name}
                {item.series_label ? ` · ${item.series_label}` : item.series_order ? ` #${item.series_order}` : ""}
              </div>
            )}
            <div className="text-xs text-slate-500">
              {item.creator}
            </div>

            <div className="pt-1">
              <PlatformLinkPills label={whereTo.label} links={whereTo.links} />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4 sm:gap-5 border-t pt-4 md:border-t-0 md:border-l border-slate-100 md:pt-0 md:pl-5 md:self-center">
          <InspectorFlowPanel index="01" title="Reading Flow" pct={flowPct} learnPct={learnFlowPct} footnote={<>{formatCompactWords(m?.total_tokens || 0)} total</>} isAuthenticated={isAuthenticated} onSignIn={onRequireAuth} barColorClass="bg-emerald-500" />
          <InspectorFlowPanel index="02" title="Vocab Mastery" pct={vocabPct} learnPct={learnVocabPct} footnote={<>{formulaShort} {fh} · {dialOrWpm}</>} isAuthenticated={isAuthenticated} onSignIn={onRequireAuth} barColorClass="bg-emerald-400" />
        </div>

        {synopsis && (
          <div className="col-span-12 border-t border-slate-100 pt-4">
            <p className={`text-sm leading-relaxed text-slate-600 ${synopsisExpanded ? "" : "line-clamp-3"}`}>
              {synopsis}
            </p>
            {synopsis.length > 180 && (
              <button
                type="button"
                onClick={() => setSynopsisExpanded((v) => !v)}
                className="mt-1.5 text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
              >
                {synopsisExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
