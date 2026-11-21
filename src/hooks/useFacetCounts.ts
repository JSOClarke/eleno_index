import { useMemo } from "react";
import { calculateFacetCounts, matchesCatalogueFilters } from "@/lib/catalogueFiltering";
import { sortCatalogueItems } from "@/lib/catalogueSorting";
import type { CatalogueFilterState, CatalogueSortOption } from "@/types/filter.types";
import type { MediaCatalogItem } from "@/types/media.types";

export function useFacetCounts(
  items: MediaCatalogItem[],
  filters: CatalogueFilterState,
  savedIds: Set<string>,
  historyIds: Set<string>,
  activeNav: string,
  sortOption: CatalogueSortOption = "popularity_desc"
) {
  const facetCounts = useMemo(
    () => calculateFacetCounts(items, filters, savedIds, historyIds, activeNav),
    [items, filters, savedIds, historyIds, activeNav]
  );

  const filteredItems = useMemo(() => {
    const matched = items.filter((item) =>
      matchesCatalogueFilters(item, filters, savedIds, historyIds, activeNav)
    );
    return sortCatalogueItems(matched, sortOption);
  }, [items, filters, savedIds, historyIds, activeNav, sortOption]);

  return { facetCounts, filteredItems };
}
