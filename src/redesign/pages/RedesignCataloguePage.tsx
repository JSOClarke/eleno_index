import React from "react";
import { useCatalogueSort } from "@/hooks/useCatalogueSort";
import { useFacetCounts } from "@/hooks/useFacetCounts";
import type { useFilterState } from "@/hooks/useFilterState";
import { RedesignMediaCard } from "@/redesign/components/RedesignMediaCard";
import { RedesignSearchFilters } from "@/redesign/components/RedesignSearchFilters";
import { RedesignSidebar } from "@/redesign/components/RedesignSidebar";
import type { MediaCatalogItem } from "@/types/media.types";

interface RedesignCataloguePageProps {
  mode: "catalogue" | "saved";
  items: MediaCatalogItem[];
  filterState: ReturnType<typeof useFilterState>;
}

export const RedesignCataloguePage: React.FC<RedesignCataloguePageProps> = ({
  mode,
  items,
  filterState,
}) => {
  const { sortOption, setSortOption } = useCatalogueSort();
  const { facetCounts, filteredItems } = useFacetCounts(
    items,
    filterState.filters,
    filterState.savedIds,
    filterState.historyIds,
    mode,
    sortOption
  );

  return (
    <div className="space-y-6">
      <RedesignSearchFilters
        searchText={filterState.searchText}
        onSearchChange={filterState.setSearchText}
        filters={filterState.filters}
        counts={facetCounts}
        sortOption={sortOption}
        onChangeSort={setSortOption}
        resultCount={filteredItems.length}
        onToggleType={filterState.toggleType}
        onToggleLevel={filterState.toggleLevel}
        onToggleHasAudio={filterState.toggleHasAudio}
        onSetFlowTier={filterState.setFlowTier}
        onClearAll={filterState.clearAll}
      />

      <div className="flex flex-col gap-8 lg:flex-row items-start">
        <RedesignSidebar
          filters={filterState.filters}
          counts={facetCounts}
          onToggleLength={filterState.toggleLength}
          onToggleProfile={filterState.toggleProfile}
        />

        <div className="flex-1 min-w-0 w-full">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-sm text-slate-500">
              No titles match your active filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <RedesignMediaCard
                  key={item.id}
                  item={item}
                  isSaved={filterState.savedIds.has(item.id)}
                  onToggleSave={filterState.toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
