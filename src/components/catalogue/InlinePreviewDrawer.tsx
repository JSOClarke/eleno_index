import React from "react";
import { Link } from "react-router-dom";
import { BookCoverPlate } from "@/components/layout/BookCoverPlate";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { PreviewWordChips } from "./PreviewWordChips";

interface InlinePreviewDrawerProps {
  item: MediaCatalogItem;
  isSaved: boolean;
  statusMap: Record<string, UserVocabStatus>;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const InlinePreviewDrawer: React.FC<InlinePreviewDrawerProps> = ({
  item,
  isSaved,
  statusMap,
  onToggleSave,
  onToggleWord,
}) => {
  const level = item.metrics?.cefr_level || "B1";
  const synopsis = item.work_synopsis || item.sampleSnippet;

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 grid grid-cols-12 gap-6 items-start">
      <div className="col-span-5 flex gap-4 items-start">
        <BookCoverPlate
          title={item.work_title || item.title}
          explicitUrl={item.cover_image_url}
          level={level}
          size="drawer"
        />
        <div className="min-w-0 space-y-1.5">
          <div className="text-xs font-semibold text-slate-500">
            Synopsis
          </div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{synopsis}</p>
        </div>
      </div>

      <div className="col-span-5">
        <div className="mb-2 text-xs font-semibold text-slate-500">
          Most common words (click to mark known)
        </div>
        <PreviewWordChips item={item} words={item.previewWords} statusMap={statusMap} onToggleWord={onToggleWord} />
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {isSaved ? "Saved ✓" : "Save"}
        </button>
        <Link
          to={`/media/${item.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-slate-900 px-3.5 text-xs font-medium text-white hover:bg-indigo-600"
        >
          Inspect Vocab →
        </Link>
      </div>
    </div>
  );
};
