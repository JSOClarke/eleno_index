import React from "react";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { CatalogueCard } from "./CatalogueCard";

interface CatalogueCardsGridProps {
  items: MediaCatalogItem[];
  loading: boolean;
  expandedRowId: string | null;
  savedIds: Set<string>;
  statusMap: Record<string, UserVocabStatus>;
  onSelectCard: (id: string) => void;
  onOpenInspector: (item: MediaCatalogItem) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueCardsGrid: React.FC<CatalogueCardsGridProps> = ({
  items,
  loading,
  expandedRowId,
  savedIds,
  statusMap,
  onSelectCard,
  onOpenInspector,
  onToggleSave,
  onToggleWord,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="border border-[#E2E2DF] bg-[#F8F8F6] h-72 animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-[#E2E2DF]" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-[#E2E2DF]" />
                <div className="h-3 w-1/2 bg-[#E2E2DF]" />
                <div className="h-10 w-full bg-[#E2E2DF]" />
              </div>
            </div>
            <div className="h-12 bg-[#E2E2DF]" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-[#111111] py-16 text-center font-mono text-xs text-[#666666] mt-4">
        No Spanish corpus works match the active filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
      {items.map((item) => (
        <CatalogueCard
          key={item.id}
          item={item}
          isSelected={expandedRowId === item.id}
          isSaved={savedIds.has(item.id)}
          statusMap={statusMap}
          onSelectCard={onSelectCard}
          onOpenInspector={onOpenInspector}
          onToggleSave={onToggleSave}
          onToggleWord={onToggleWord}
        />
      ))}
    </div>
  );
};
