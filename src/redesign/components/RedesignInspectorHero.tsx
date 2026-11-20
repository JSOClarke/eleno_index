import React, { useState } from "react";
import { resolveCoverArt } from "@/lib/coverArt";
import { formatCompactWords, formatPercent } from "@/lib/formatters";
import { getCefrBadgeClass, getPlatformLinks } from "@/redesign/lib/displayHelpers";
import type { MediaCatalogItem } from "@/types/media.types";
import { RedesignFlowMetricCard } from "./RedesignFlowMetricCard";

interface RedesignInspectorHeroProps {
  item: MediaCatalogItem;
}

export const RedesignInspectorHero: React.FC<RedesignInspectorHeroProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = (m?.readability_score || 70).toFixed(1);
  const wpm = m?.words_per_minute ? Math.round(m.words_per_minute) : null;
  const dialOrWpm = wpm ? `${wpm} WPM` : `Dial ${formatPercent(m?.dialogue_ratio, 1)}`;

  const comp = item.comprehension;
  const flowPct = comp?.text_coverage_percentage ?? comp?.comprehension_percentage ?? 0;
  const learnFlowPct = comp?.learning_text_coverage_percentage ?? 0;
  const vocabPct = comp?.comprehension_percentage ?? 0;
  const learnVocabPct = comp?.learning_percentage ?? 0;

  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;
  const whereTo = getPlatformLinks(item);
  const coverMeta = resolveCoverArt(targetTitle || englishTitle, item.cover_image_url);
  const showFallback = !coverMeta.coverUrl || imgError;

  return (
    <section className="grid grid-cols-12 gap-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm items-start">
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <div className="flex items-start gap-5">
          <div
            className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200/80 shadow-md flex flex-col justify-between p-2.5 select-none"
            style={{ backgroundColor: showFallback ? coverMeta.coverBg : "#F1F5F9" }}
          >
            {showFallback ? (
              <>
                <span className="text-[10px] font-semibold uppercase text-white/80">{level}</span>
                <span className="font-serif text-xs font-semibold leading-tight text-white line-clamp-3">
                  {targetTitle || englishTitle}
                </span>
              </>
            ) : (
              <img
                src={coverMeta.coverUrl!}
                alt={targetTitle || englishTitle}
                onError={() => setImgError(true)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCefrBadgeClass(level)}`}>
                {level}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                {item.language}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {(item.type || "book").replace(/_/g, " ")}
                {item.format ? ` · ${item.format}` : ""}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 leading-tight">
              {englishTitle}
            </h1>
            {targetTitle && (
              <div className="text-sm font-medium text-slate-600">{targetTitle}</div>
            )}
            <div className="text-xs text-slate-500">
              {item.creator}
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="text-slate-400">{whereTo.label}</span>
              {whereTo.platforms.map((p) => (
                <span key={p} className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          {item.work_synopsis || item.sampleSnippet}
        </p>
      </div>

      <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-6 border-t pt-5 lg:border-t-0 lg:border-l border-slate-100 lg:pt-0 lg:pl-6">
        <RedesignFlowMetricCard
          index="01"
          title="Reading Flow"
          pct={flowPct}
          learnPct={learnFlowPct}
          footnote={<>{formatCompactWords(m?.total_tokens || 0)} total tokens</>}
          barColorClass="bg-emerald-500"
        />
        <RedesignFlowMetricCard
          index="02"
          title="Vocab Mastery"
          pct={vocabPct}
          learnPct={learnVocabPct}
          footnote={<>F-H {fh} · {dialOrWpm}</>}
          barColorClass="bg-indigo-600"
        />
      </div>
    </section>
  );
};
