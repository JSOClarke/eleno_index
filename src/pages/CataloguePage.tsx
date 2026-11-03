import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CatalogueCardsGrid } from "@/components/catalogue/CatalogueCardsGrid";
import { CatalogueFiltersSheet } from "@/components/catalogue/CatalogueFiltersSheet";
import { CatalogueTable } from "@/components/catalogue/CatalogueTable";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CommandFilterBar } from "@/components/catalogue/CommandFilterBar";
import { FacetSidebar } from "@/components/catalogue/FacetSidebar";
import { useFacetCounts } from "@/hooks/useFacetCounts";
import type { useFilterState } from "@/hooks/useFilterState";
import type { CatalogueViewMode } from "@/types/filter.types";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface CataloguePageProps {
  mode: "catalogue" | "saved" | "history";
  items: MediaCatalogItem[];
  loading: boolean;
  filterState: ReturnType<typeof useFilterState>;
  statusMap: Record<string, UserVocabStatus>;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  mode,
  items,
  loading,
  filterState,
  statusMap,
  onToggleWord,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const viewMode: CatalogueViewMode = viewParam === "table" ? "table" : "cards";
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { facetCounts, filteredItems } = useFacetCounts(
    items,
    filterState.filters,
    filterState.savedIds,
    filterState.historyIds,
    mode
  );

  const activeFilterCount =
    filterState.filters.levels.size +
    filterState.filters.types.size +
    filterState.filters.lengths.size +
    filterState.filters.profiles.size;

  const handleChangeViewMode = (nextMode: CatalogueViewMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextMode === "cards") next.delete("view");
      else next.set("view", nextMode);
      return next;
    });
  };

  const toggleExpand = (id: string) =>
    setExpandedRowId((prev) => (prev === id ? null : id));

  const sharedCatalogueProps = {
    items: filteredItems,
    loading,
    expandedRowId,
    savedIds: filterState.savedIds,
    statusMap,
    onToggleSave: filterState.toggleSave,
    onToggleWord,
  };

  return (
    <div className="space-y-6">
      <CommandFilterBar
        tags={filterState.filters.tags}
        searchText={filterState.searchText}
        onSearchChange={filterState.setSearchText}
        onRemoveTag={filterState.removeTag}
        onAddTag={filterState.addTag}
        onClearAll={filterState.clearAll}
      />

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="hidden md:block">
          <FacetSidebar
            filters={filterState.filters}
            counts={facetCounts}
            onToggleLevel={filterState.toggleLevel}
            onToggleType={filterState.toggleType}
            onToggleLength={filterState.toggleLength}
            onToggleProfile={filterState.toggleProfile}
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <CatalogueToolbar
            resultCount={filteredItems.length}
            viewMode={viewMode}
            onChangeViewMode={handleChangeViewMode}
            activeFilterCount={activeFilterCount}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          {viewMode === "cards" ? (
            <CatalogueCardsGrid
              {...sharedCatalogueProps}
              onSelectCard={toggleExpand}
            />
          ) : (
            <CatalogueTable
              {...sharedCatalogueProps}
              onToggleExpand={toggleExpand}
            />
          )}
        </div>
      </div>

      <CatalogueFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filterState.filters}
        counts={facetCounts}
        onToggleLevel={filterState.toggleLevel}
        onToggleType={filterState.toggleType}
        onToggleLength={filterState.toggleLength}
        onToggleProfile={filterState.toggleProfile}
        resultCount={filteredItems.length}
        onClearAll={filterState.clearAll}
      />
    </div>
  );
};
