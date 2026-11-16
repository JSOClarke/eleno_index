import React from "react";
import type { MediaCatalogItem } from "@/types/media.types";
import { CatalogueMosaicTile } from "./CatalogueMosaicTile";

interface CatalogueMosaicGridProps {
  items: MediaCatalogItem[];
  loading: boolean;
  savedIds: Set<string>;
  isAuthenticated: boolean;
  onToggleSave: (id: string) => void;
}

export const CatalogueMosaicGrid: React.FC<CatalogueMosaicGridProps> = ({
  items,
  loading,
  savedIds,
  isAuthenticated,
  onToggleSave,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-slate-100" />
            <div className="p-3.5 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-sm text-slate-500">
        No titles match your active filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-5">
      {items.map((item) => (
        <CatalogueMosaicTile
          key={item.id}
          item={item}
          isSaved={savedIds.has(item.id)}
          isAuthenticated={isAuthenticated}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
};
