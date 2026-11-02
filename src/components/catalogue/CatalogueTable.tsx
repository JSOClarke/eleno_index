import React from "react";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { CatalogueTableRow } from "./CatalogueTableRow";

interface CatalogueTableProps {
  items: MediaCatalogItem[];
  loading: boolean;
  expandedRowId: string | null;
  savedIds: Set<string>;
  statusMap: Record<string, UserVocabStatus>;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CatalogueTable: React.FC<CatalogueTableProps> = ({
  items,
  loading,
  expandedRowId,
  savedIds,
  statusMap,
  onToggleExpand,
  onToggleSave,
  onToggleWord,
}) => {
  return (
    <div>
      <div className="grid grid-cols-12 gap-3 px-3.5 py-2.5 border-b border-[#E2E2DF] font-mono text-xs text-[#777777] uppercase tracking-wider">
        <div className="col-span-4">TITLE</div>
        <div className="col-span-1">LEVEL</div>
        <div className="col-span-2">LENGTH</div>
        <div className="col-span-2">AUTHOR</div>
        <div className="col-span-2">KNOWN WORDS</div>
        <div className="col-span-1 text-right">PROFILE</div>
      </div>

      {loading ? (
        <div className="divide-y divide-[#E2E2DF]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-16 bg-[#F8F8F6] animate-pulse px-3.5 flex items-center"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center font-mono text-xs text-[#666666]">
          No Spanish corpus works match the active filters.
        </div>
      ) : (
        <div className="divide-y divide-[#E2E2DF]">
          {items.map((item) => (
            <CatalogueTableRow
              key={item.id}
              item={item}
              isExpanded={expandedRowId === item.id}
              isSaved={savedIds.has(item.id)}
              statusMap={statusMap}
              onToggleExpand={onToggleExpand}
              onToggleSave={onToggleSave}
              onToggleWord={onToggleWord}
            />
          ))}
        </div>
      )}
    </div>
  );
};
