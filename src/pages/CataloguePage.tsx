import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CatalogueCardsGrid } from "@/components/catalogue/CatalogueCardsGrid";
import { CatalogueFiltersSheet } from "@/components/catalogue/CatalogueFiltersSheet";
import { CataloguePagination } from "@/components/catalogue/CataloguePagination";
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
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onToggleWord: (item: MediaCatalogItem, word: PreviewWordItem) => void;
  onEnsurePreviewWords?: (mediaIds: string[]) => void;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  mode, items, loading, filterState, statusMap, isAuthenticated, onRequireAuth, onToggleWord, onEnsurePreviewWords,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode: CatalogueViewMode = searchParams.get("view") === "table" ? "table" : "cards";
  const pageSize = viewMode === "table" ? 40 : 24;
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { facetCounts, filteredItems } = useFacetCounts(
    items, filterState.filters, filterState.savedIds, filterState.historyIds, mode
  );

  useEffect(() => { setCurrentPage(1); }, [mode, viewMode, filterState.filters, filterState.searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = useMemo(
    () => filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredItems, safePage, pageSize]
  );

  useEffect(() => {
    if (onEnsurePreviewWords && pagedItems.length > 0) {
      onEnsurePreviewWords(pagedItems.map((it) => it.id));
    }
  }, [pagedItems, onEnsurePreviewWords]);

  const activeFilterCount =
    filterState.filters.levels.size + filterState.filters.types.size +
    filterState.filters.lengths.size + filterState.filters.profiles.size;

  const handleChangeViewMode = (nextMode: CatalogueViewMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextMode === "cards") next.delete("view");
      else next.set("view", nextMode);
      return next;
    });
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExpand = (id: string) => setExpandedRowId((prev) => (prev === id ? null : id));

  const sharedCatalogueProps = {
    items: pagedItems, loading, expandedRowId, savedIds: filterState.savedIds,
    statusMap, isAuthenticated, onRequireAuth, onToggleSave: filterState.toggleSave, onToggleWord,
  };

  return (
    <div className="space-y-6">
      <CommandFilterBar
        tags={filterState.filters.tags} searchText={filterState.searchText}
        onSearchChange={filterState.setSearchText} onRemoveTag={filterState.removeTag}
        onAddTag={filterState.addTag} onClearAll={filterState.clearAll}
      />
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="hidden md:block">
          <FacetSidebar
            filters={filterState.filters} counts={facetCounts}
            onToggleLevel={filterState.toggleLevel} onToggleType={filterState.toggleType}
            onToggleLength={filterState.toggleLength} onToggleProfile={filterState.toggleProfile}
          />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <CatalogueToolbar
            resultCount={filteredItems.length} viewMode={viewMode}
            onChangeViewMode={handleChangeViewMode} activeFilterCount={activeFilterCount}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          {viewMode === "cards" ? (
            <CatalogueCardsGrid {...sharedCatalogueProps} onSelectCard={toggleExpand} />
          ) : (
            <CatalogueTable {...sharedCatalogueProps} onToggleExpand={toggleExpand} />
          )}
          <CataloguePagination
            currentPage={safePage} totalPages={totalPages}
            totalItems={filteredItems.length} pageSize={pageSize} onPageChange={handlePageChange}
          />
        </div>
      </div>
      <CatalogueFiltersSheet
        open={filtersOpen} onClose={() => setFiltersOpen(false)}
        filters={filterState.filters} counts={facetCounts}
        onToggleLevel={filterState.toggleLevel} onToggleType={filterState.toggleType}
        onToggleLength={filterState.toggleLength} onToggleProfile={filterState.toggleProfile}
        resultCount={filteredItems.length} onClearAll={filterState.clearAll}
      />
    </div>
  );
};
