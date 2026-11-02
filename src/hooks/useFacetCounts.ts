import { useMemo } from "react";
import {
  getLengthBucket,
  getMediaCategoryLabel,
  toPercentNumber,
} from "@/lib/formatters";
import type { CatalogueFilterState } from "@/types/filter.types";
import type { MediaCatalogItem } from "@/types/media.types";

export function useFacetCounts(
  items: MediaCatalogItem[],
  filters: CatalogueFilterState,
  savedIds: Set<string>,
  historyIds: Set<string>,
  activeNav: string
) {
  const facetCounts = useMemo(() => {
    const levels: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    const types: Record<string, number> = {
      "Reader / book": 0,
      "Short story": 0,
      "Lore / guide": 0,
    };
    const lengths: Record<string, number> = {
      under25k: 0,
      "25to80k": 0,
      "80k+": 0,
    };
    const profiles: Record<string, number> = {
      dialogue20: 0,
      fh70: 0,
      subj2: 0,
    };

    for (const item of items) {
      const m = item.metrics;
      const cefr = m?.cefr_level || "B1";
      if (levels[cefr] !== undefined) levels[cefr] += 1;

      const cat = getMediaCategoryLabel(item);
      if (types[cat] !== undefined) types[cat] += 1;

      const bucket = getLengthBucket(m?.total_tokens || 0);
      lengths[bucket] = (lengths[bucket] || 0) + 1;

      if (toPercentNumber(m?.dialogue_ratio) >= 20) profiles.dialogue20 += 1;
      if ((m?.readability_score || 0) >= 70) profiles.fh70 += 1;
      if (toPercentNumber(m?.verb_profile?.subjunctive_load) >= 5) profiles.subj2 += 1;
    }

    return { levels, types, lengths, profiles };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (activeNav === "saved" && !savedIds.has(item.id)) return false;
        if (activeNav === "history" && !historyIds.has(item.id)) return false;

        const m = item.metrics;
        const cefr = m?.cefr_level || "B1";
        if (filters.levels.size > 0 && !filters.levels.has(cefr)) return false;

        const cat = getMediaCategoryLabel(item);
        if (filters.types.size > 0 && !filters.types.has(cat)) return false;

        const bucket = getLengthBucket(m?.total_tokens || 0);
        if (filters.lengths.size > 0 && !filters.lengths.has(bucket)) return false;

        if (filters.profiles.has("dialogue20") && toPercentNumber(m?.dialogue_ratio) < 20) {
          return false;
        }
        if (filters.profiles.has("fh70") && (m?.readability_score || 0) < 70) {
          return false;
        }
        if (
          filters.profiles.has("subj2") &&
          toPercentNumber(m?.verb_profile?.subjunctive_load) < 5
        ) {
          return false;
        }

        if (filters.searchText.trim()) {
          const q = filters.searchText.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCreator = item.creator.toLowerCase().includes(q);
          const matchWord = item.previewWords.some((w) =>
            w.lemma.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchCreator && !matchWord) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const flowA = a.comprehension?.text_coverage_percentage ?? 0;
        const flowB = b.comprehension?.text_coverage_percentage ?? 0;
        if (flowB !== flowA) return flowB - flowA;
        return (b.metrics?.readability_score || 0) - (a.metrics?.readability_score || 0);
      });
  }, [items, filters, savedIds, historyIds, activeNav]);

  return { facetCounts, filteredItems };
}
