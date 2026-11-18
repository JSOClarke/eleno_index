import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { MediaCatalogItem, MediaComprehensionStats } from "@/types/media.types";
import { ReadflowLinguisticStrip } from "./ReadflowLinguisticStrip";

interface ReadflowInspectorHeaderProps {
  item: MediaCatalogItem;
  comprehension: MediaComprehensionStats | null;
}

export const ReadflowInspectorHeader: React.FC<ReadflowInspectorHeaderProps> = ({ item, comprehension }) => {
  const cov = comprehension?.text_coverage_percentage ?? comprehension?.comprehension_percentage ?? 0;
  const isReady = cov >= 95;
  const badgeBg = isReady ? "bg-[#E2F59B]" : "bg-[#D8D6FA]";
  const totalWords = comprehension?.total_words ?? item.metrics?.unique_words_count ?? 0;
  const knownWords = comprehension?.known_words ?? 0;
  const learningWords = comprehension?.learning_words ?? 0;
  const unknowns = comprehension ? Math.max(0, totalWords - knownWords) : totalWords;
  const m = item.metrics;
  const synopsis = item.work_synopsis || item.sampleSnippet;
  const englishTitle = item.work_title || item.title;
  const targetTitle = item.work_title && item.title !== item.work_title ? item.title : null;

  return (
    <div className="space-y-4">
      <Link to="/preview" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#ECECEF] text-xs font-bold text-[#040404] hover:border-[#040404] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Corpus</span>
      </Link>

      <section className="bg-white rounded-3xl border border-[#ECECEF] overflow-hidden flex flex-col md:flex-row">
        <div className="poster-frame w-full md:w-[270px] aspect-[3/4] md:aspect-auto md:min-h-[350px] shrink-0 relative">
          {item.cover_image_url ? (
            <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#18181B] to-[#09090B]">
              <span className="font-editorial text-4xl text-white/85 text-center leading-tight">{item.title}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-[#040404]/85 text-white text-[11px] font-bold border border-white/15">
              {(item.language || "es").toUpperCase()} · {item.type}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded-lg ${badgeBg} text-[#040404] text-[11px] font-extrabold`}>
              {m?.cefr_level ? `${m.cefr_level} Level` : "Indexed"}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D8D6FA] text-[#040404] text-[11px] font-extrabold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{targetTitle ? `${targetTitle} · ${item.creator || "Unknown author"}` : item.creator || "Unknown author"}</span>
              </div>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[#040404] leading-[0.95]">{englishTitle}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl ${badgeBg} text-[#040404] text-[11px] font-extrabold`}>
                  {unknowns.toLocaleString()} unknown lemmas
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-[#F3E1E6] text-[11px] font-extrabold text-[#040404]">
                  {knownWords.toLocaleString()} known · {learningWords.toLocaleString()} learning
                </span>
              </div>
              {synopsis && (
                <p className="mt-3 text-[13px] leading-relaxed text-[#5A595C] line-clamp-3 max-w-2xl">
                  {synopsis}
                </p>
              )}
            </div>

            <div className={`rounded-2xl ${badgeBg} p-4 sm:min-w-[170px] text-left lg:text-right shrink-0`}>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#040404]/70">Your Coverage</span>
              <span className="font-editorial text-5xl leading-none text-[#040404] mt-1 block">
                {comprehension ? `${cov.toFixed(1)}%` : "—"}
              </span>
              <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden mt-2.5">
                <div className="h-full bg-[#040404] rounded-full" style={{ width: `${Math.min(100, Math.max(0, cov))}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white/90 rounded-2xl border border-[#ECECEF] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-[#ECECEF]">
            <div className="sm:pr-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Total Tokens</span>
              <span className="font-editorial text-3xl text-[#040404] mt-0.5 block">{(m?.total_tokens ?? 0).toLocaleString()}</span>
            </div>
            <div className="sm:px-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Unique Lemmas</span>
              <span className="font-editorial text-3xl text-[#040404] mt-0.5 block">{(m?.unique_words_count ?? 0).toLocaleString()}</span>
            </div>
            <div className="sm:px-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">Hapax %</span>
              <span className="font-editorial text-3xl text-[#040404] mt-0.5 block">
                {m?.hapax_percentage != null ? `${m.hapax_percentage.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div className="sm:pl-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A595C]">95% Target</span>
              <span className="font-editorial text-3xl text-[#040404] mt-0.5 block">
                {m?.coverage_95_lemmas != null ? `${m.coverage_95_lemmas.toLocaleString()}w` : "—"}
              </span>
            </div>
          </div>

          <ReadflowLinguisticStrip metrics={m} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#5A595C]">
              {m?.mean_sentence_length ? `Avg sentence ${m.mean_sentence_length.toFixed(1)} words` : "Corpus metrics indexed"}
              {m?.dialogue_ratio != null ? ` · ${(m.dialogue_ratio * 100).toFixed(0)}% dialogue` : ""}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
