import React from "react";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface PreviewWordChipsProps {
  item: MediaCatalogItem;
  words: PreviewWordItem[];
  statusMap: Record<string, UserVocabStatus>;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
  compact?: boolean;
}

export const PreviewWordChips: React.FC<PreviewWordChipsProps> = ({
  item,
  words,
  statusMap,
  onToggleWord,
  compact = false,
}) => (
  <div className="flex flex-wrap gap-1.5">
    {words.map((w) => {
      const isKnown = statusMap[w.canonical_id] === "known";
      return (
        <button
          key={w.canonical_id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWord(item, w);
          }}
          className={`rounded-full font-medium transition cursor-pointer ${
            compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
          } ${
            isKnown
              ? "bg-emerald-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          {isKnown ? "✓ " : ""}
          {w.lemma} <span className="opacity-60">{w.frequency}×</span>
        </button>
      );
    })}
  </div>
);
