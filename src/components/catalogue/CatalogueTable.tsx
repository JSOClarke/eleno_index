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
  isAuthenticated: boolean;
  onRequireAuth: () => void;
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
  isAuthenticated,
  onRequireAuth,
  onToggleExpand,
  onToggleSave,
  onToggleWord,
}) => {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="hidden grid-cols-12 gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
        <div className="col-span-4">Title</div>
        <div className="col-span-1">Level</div>
        <div className="col-span-2">Length</div>
        <div className="col-span-2">Creator</div>
        <div className="col-span-2">Vocab Match</div>
        <div className="col-span-1 text-right">Readability</div>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-16 bg-slate-50/50 animate-pulse px-4 flex items-center" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">
          No works match the active filters.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <CatalogueTableRow
              key={item.id}
              item={item}
              isExpanded={expandedRowId === item.id}
              isSaved={savedIds.has(item.id)}
              statusMap={statusMap}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
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
