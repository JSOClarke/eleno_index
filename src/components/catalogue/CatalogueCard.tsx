import React from "react";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import { formatCompactWords, getMediaSubtypeLabel } from "@/lib/formatters";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface CatalogueCardProps {
  item: MediaCatalogItem;
  isSelected: boolean;
  isSaved: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onSelectCard: (id: string) => void;
  onOpenInspector: (item: MediaCatalogItem) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({
  item,
  isSelected,
  isSaved,
  statusMap,
  onSelectCard,
  onOpenInspector,
  onToggleSave,
  onToggleWord,
}) => {
  const m = item.metrics;
  const level = m?.cefr_level || "B1";
  const fh = Math.round(m?.readability_score || 70);
  const flowPct = Math.round(
    item.comprehension?.text_coverage_percentage ??
      item.comprehension?.comprehension_percentage ??
      0
  );
  const vocabPct = Math.round(item.comprehension?.comprehension_percentage ?? 0);
  const dialPct = ((m?.dialogue_ratio || 0) * 100).toFixed(1);
  const subjPct = ((m?.verb_profile?.subjunctive_load || 0) * 100).toFixed(1);

  return (
    <div
      onClick={() => onSelectCard(item.id)}
      className={`border border-[#111111] bg-white flex flex-col justify-between transition-all cursor-pointer ${
        isSelected ? "shadow-[4px_4px_0px_#111111]" : "hover:bg-[#FAFAFA]"
      }`}
    >
      <div>
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b border-[#111111] font-mono text-xs ${
            isSelected ? "bg-[#B8FF01] text-[#111111] font-semibold" : "bg-[#F8F8F6] text-[#555555]"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span>{getMediaSubtypeLabel(item)}</span>
            <span>·</span>
            <span>{item.creator}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.2 border border-[#111111] text-[#111111] font-bold bg-white">
              {level}
            </span>
            <span className="px-1.5 py-0.2 border border-[#111111]/30 text-[#111111]">
              F-H {fh}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex gap-4 items-start">
            <BookCoverPlate title={item.title} explicitUrl={item.cover_image_url} level={level} size="card" />
            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <h3 className="text-base font-bold text-[#111111] leading-snug">{item.title}</h3>
                <div className="font-mono text-xs text-[#666666] mt-0.5">
                  {formatCompactWords(m?.total_tokens || 0)} · {dialPct}% dialogue · {subjPct}% subj
                </div>
              </div>
              <div className="bg-[#F4F4F2] border border-[#E2E2DF] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#555555]">KNOWN WORDS</span>
                  <span className="font-bold text-[#111111] tabular-nums">{flowPct}% ({vocabPct}% voc)</span>
                </div>
                <div className="w-full h-2 border border-[#111111] bg-white overflow-hidden">
                  <div className="h-full bg-[#111111] transition-all duration-200" style={{ width: `${flowPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-l-2 border-[#111111] pl-3 py-0.5">
            <div className="font-mono text-xs uppercase text-[#777777] mb-0.5">{item.sampleSourceLabel}</div>
            <p className="font-serif text-sm text-[#222222] italic line-clamp-2">{item.sampleSnippet}</p>
          </div>

          <div>
            <div className="font-mono text-xs uppercase text-[#777777] mb-1.5">NEW WORDS FOR YOU</div>
            <div className="flex flex-wrap gap-1.5">
              {item.previewWords.slice(0, 6).map((w) => {
                const isKnown = statusMap[w.canonical_id] === "known";
                return (
                  <button
                    key={w.canonical_id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleWord(item, w); }}
                    className={`px-2 py-0.5 text-xs font-mono border transition-colors cursor-pointer ${
                      isKnown
                        ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
                        : "border-[#CCCCCC] bg-white text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    {isKnown ? "✓ " : ""}{w.lemma} <span className="opacity-60">{w.frequency}x</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[#E2E2DF] bg-[#F8F8F6] flex items-center justify-between">
        <span className="font-mono text-xs text-[#666666]">{m?.unique_words_count || 0} unique lemmas</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSave(item.id); }}
            className="px-3 py-1.5 bg-white text-[#111111] text-xs font-medium border border-[#111111] hover:bg-[#EAEAE6] cursor-pointer"
          >
            {isSaved ? "Saved ✓" : "Save"}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenInspector(item); }}
            className="px-3.5 py-1.5 bg-[#111111] text-white text-xs font-medium border border-[#111111] hover:bg-[#333333] cursor-pointer"
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  );
};
