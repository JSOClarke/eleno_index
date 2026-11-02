import React from "react";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface InlinePreviewDrawerProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onOpenInspector: (item: MediaCatalogItem) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const InlinePreviewDrawer: React.FC<InlinePreviewDrawerProps> = ({
  item,
  isSaved,
  statusMap,
  onOpenInspector,
  onToggleSave,
  onToggleWord,
}) => {
  const level = item.metrics?.cefr_level || "B1";

  return (
    <div className="bg-[#F4F4F2] border-t border-[#E2E2DF] px-5 py-5 grid grid-cols-12 gap-6 items-start">
      {/* Cover + Sample Line */}
      <div className="col-span-5 flex gap-4 items-start">
        <BookCoverPlate
          title={item.title}
          explicitUrl={item.cover_image_url}
          level={level}
          size="drawer"
        />
        <div className="min-w-0">
          <div className="font-mono text-xs uppercase tracking-wider text-[#777777] mb-2">
            {item.sampleSourceLabel}
          </div>
          <p className="font-serif text-base text-[#111111] leading-relaxed">
            {item.sampleSnippet}
          </p>
        </div>
      </div>

      {/* Interactive New Words For You */}
      <div className="col-span-5">
        <div className="font-mono text-xs uppercase tracking-wider text-[#777777] mb-2">
          NEW WORDS FOR YOU (CLICK TO MARK KNOWN)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.previewWords.map((w) => {
            const isKnown = statusMap[w.canonical_id] === "known";
            return (
              <button
                key={w.canonical_id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWord(item, w);
                }}
                title={`Appears ${w.frequency}x in book · Click to toggle Known`}
                className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                  isKnown
                    ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
                    : "border-[#CCCCCC] bg-white text-[#111111] hover:border-[#111111]"
                }`}
              >
                {isKnown ? "✓ " : ""}
                {w.lemma} <span className="opacity-60">{w.frequency}x</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInspector(item);
          }}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-medium border border-[#111111] hover:bg-[#333333] cursor-pointer"
        >
          Open
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          className="px-3.5 py-2 bg-white text-[#111111] text-xs font-medium border border-[#111111] hover:bg-[#EAEAE6] cursor-pointer"
        >
          {isSaved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
};
