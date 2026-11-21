import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { CatalogueSortOption } from "@/types/filter.types";

const VALID_SORT_OPTIONS = new Set<CatalogueSortOption>([
  "flow_desc",
  "popularity_desc",
  "difficulty_asc",
  "difficulty_desc",
  "tokens_asc",
  "tokens_desc",
  "readability_desc",
  "dialogue_desc",
  "title_asc",
  "title_desc",
  "newest",
]);

export function useCatalogueSort() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSort = searchParams.get("sort") as CatalogueSortOption | null;
  const initialSort: CatalogueSortOption =
    urlSort && VALID_SORT_OPTIONS.has(urlSort) ? urlSort : "popularity_desc";

  const [sortOption, setSortOptionState] = useState<CatalogueSortOption>(initialSort);

  const setSortOption = useCallback(
    (newSort: CatalogueSortOption) => {
      setSortOptionState(newSort);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newSort === "popularity_desc") {
          next.delete("sort");
        } else {
          next.set("sort", newSort);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  return { sortOption, setSortOption };
}
