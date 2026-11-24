import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buildFilterSignature, buildPageSearchParams, parsePageParam } from "@/lib/cataloguePagination";
import { CatalogueCardsGrid } from "@/components/catalogue/CatalogueCardsGrid";
import { CatalogueFiltersSheet } from "@/components/catalogue/CatalogueFiltersSheet";
import { CatalogueMosaicGrid } from "@/components/catalogue/CatalogueMosaicGrid";
import { CataloguePagination } from "@/components/catalogue/CataloguePagination";
import { CatalogueTable } from "@/components/catalogue/CatalogueTable";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CommandFilterBar, PinnedFilterTags } from "@/components/catalogue/CommandFilterBar";
import { useCatalogueSort } from "@/hooks/useCatalogueSort";
import { readStoredCatalogueView, writeStoredCatalogueView } from "@/lib/catalogueView";
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
  const rawView = searchParams.get("view");
  const viewMode: CatalogueViewMode =
    rawView === "table" || rawView === "mosaic" || rawView === "cards" ? rawView : readStoredCatalogueView();
  const pageSize = 20;
  const currentPage = parsePageParam(searchParams.get("page"));
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { sortOption, setSortOption } = useCatalogueSort();

  const seriesSiblingsMap = useMemo(() => {
    const map = new Map<string, MediaCatalogItem[]>();
    for (const it of items) {
      if (!it.series_id) continue;
      const list = map.get(it.series_id);
      if (list) list.push(it);
      else map.set(it.series_id, [it]);
    }
    return map;
  }, [items]);

  const { facetCounts, filteredItems } = useFacetCounts(
    items, filterState.filters, filterState.savedIds, filterState.historyIds, mode, sortOption
  );

  const filterSignature = useMemo(() => buildFilterSignature(mode, sortOption, filterState.filters), [mode, sortOption, filterState.filters]);
  const prevFilterSigRef = useRef(filterSignature);
  useEffect(() => {
    if (prevFilterSigRef.current === filterSignature) return;
    prevFilterSigRef.current = filterSignature;
    if (parsePageParam(searchParams.get("page")) > 1) {
      setSearchParams((prev) => buildPageSearchParams(prev, 1), { replace: true });
    }
  }, [filterSignature, searchParams, setSearchParams]);

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

  const activeFilterCount = filterState.filters.levels.size + filterState.filters.types.size +
    filterState.filters.origins.size + filterState.filters.lengths.size + filterState.filters.profiles.size +
    (filterState.filters.hasAudio ? 1 : 0) + (filterState.filters.flowTier !== "all" ? 1 : 0);

  const handleChangeViewMode = (nextMode: CatalogueViewMode) => {
    writeStoredCatalogueView(nextMode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextMode === "cards") next.delete("view");
      else next.set("view", nextMode);
      return next;
    });
  };

  const handlePageChange = (nextPage: number) => {
    setSearchParams((prev) => buildPageSearchParams(prev, nextPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExpand = (id: string) => setExpandedRowId((prev) => (prev === id ? null : id));

  const sharedCatalogueProps = {
    items: pagedItems, loading, expandedRowId, savedIds: filterState.savedIds,
    statusMap, isAuthenticated, onRequireAuth, onToggleSave: filterState.toggleSave, onToggleWord,
  };

  const paginationProps = { currentPage: safePage, totalPages, totalItems: filteredItems.length, pageSize, onPageChange: handlePageChange };

  return (
    <div className="w-full">
      <CatalogueToolbar
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode} activeFilterCount={activeFilterCount}
        onOpenFilters={() => setFiltersOpen(true)} sortOption={sortOption} onChangeSort={setSortOption}
        searchSlot={
          <CommandFilterBar
            tags={filterState.filters.tags} searchText={filterState.searchText}
            onSearchChange={filterState.setSearchText} onRemoveTag={filterState.removeTag}
            onAddTag={filterState.addTag} onClearAll={filterState.clearAll}
          />
        }
        tagsSlot={<PinnedFilterTags tags={filterState.filters.tags} onRemoveTag={filterState.removeTag} />}
      />
      <CataloguePagination {...paginationProps} placement="top" />
      {viewMode === "cards" ? (
        <CatalogueCardsGrid {...sharedCatalogueProps} seriesSiblingsMap={seriesSiblingsMap} searchText={filterState.searchText} onSelectCard={toggleExpand} />
      ) : viewMode === "mosaic" ? (
        <CatalogueMosaicGrid
          items={pagedItems} loading={loading} savedIds={filterState.savedIds}
          isAuthenticated={isAuthenticated} onToggleSave={filterState.toggleSave}
        />
      ) : (
        <CatalogueTable {...sharedCatalogueProps} onToggleExpand={toggleExpand} />
      )}
      <CataloguePagination {...paginationProps} />

      <CatalogueFiltersSheet
        open={filtersOpen} onClose={() => setFiltersOpen(false)}
        filters={filterState.filters} counts={facetCounts} language={items[0]?.language}
        onToggleLevel={filterState.toggleLevel} onToggleType={filterState.toggleType} onToggleOrigin={filterState.toggleOrigin}
        onToggleLength={filterState.toggleLength} onToggleProfile={filterState.toggleProfile}
        onToggleGenre={filterState.toggleGenre} onTogglePublisher={filterState.togglePublisher}
        onToggleYear={filterState.toggleYear}
        onToggleHasAudio={filterState.toggleHasAudio} onSetFlowTier={filterState.setFlowTier}
        resultCount={filteredItems.length} onClearAll={filterState.clearAll}
      />
    </div>
  );
};
