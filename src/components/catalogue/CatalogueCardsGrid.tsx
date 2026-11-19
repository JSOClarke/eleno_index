import React from "react";
import { openFeedbackModal } from "@/components/layout/FeedbackHub";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { CatalogueCard } from "./CatalogueCard";

interface CatalogueCardsGridProps {
  items: MediaCatalogItem[];
  loading: boolean;
  expandedRowId: string | null;
  savedIds: Set<string>;
  seriesSiblingsMap?: Map<string, MediaCatalogItem[]>;
  searchText?: string;
  statusMap: Record<string, UserVocabStatus>;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onSelectCard: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueCardsGrid: React.FC<CatalogueCardsGridProps> = ({
  items,
  loading,
  expandedRowId,
  savedIds,
  seriesSiblingsMap,
  searchText,
  statusMap,
  isAuthenticated,
  onRequireAuth,
  onSelectCard,
  onToggleSave,
  onToggleWord,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-slate-200/80 bg-white h-64 animate-pulse overflow-hidden flex"
          >
            <div className="w-44 bg-slate-100 shrink-0" />
            <div className="flex-1 p-5 space-y-3">
              <div className="h-5 w-2/3 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100 mt-4" />
              <div className="h-14 w-full rounded bg-slate-100 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    const q = searchText?.trim();
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 px-4 text-center text-sm text-slate-500 space-y-3">
        <p>No titles match your active filters. Try clearing a filter or broadening your search.</p>
        {q && (
          <button
            type="button"
            onClick={() => openFeedbackModal({ kind: "media_request", title: q })}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer transition"
          >
            Request “{q}” for the library
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">
      {items.map((item) => (
        <CatalogueCard
          key={item.id}
          item={item}
          isSelected={expandedRowId === item.id}
          isSaved={savedIds.has(item.id)}
          seriesSiblings={item.series_id ? seriesSiblingsMap?.get(item.series_id) : undefined}
          statusMap={statusMap}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onSelectCard={onSelectCard}
          onToggleSave={onToggleSave}
          onToggleWord={onToggleWord}
        />
      ))}
    </div>
  );
};
