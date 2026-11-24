import type { CatalogueSortOption } from "@/types/filter.types";
import type { MediaCatalogItem } from "@/types/media.types";

const CEFR_RANK: Record<string, number> = {
  A1: 1, "HSK 1": 1, N5: 1, TEU: 1,
  A2: 2, "HSK 2": 2, N4: 2, TBU: 2,
  B1: 3, "HSK 3": 3, N3: 3, "TRKI 1": 3,
  B2: 4, "HSK 4": 4, N2: 4, "TRKI 2": 4,
  C1: 5, "HSK 5": 5, N1: 5, "TRKI 3": 5,
  C2: 6, "HSK 6": 6, "N1+": 6, "TRKI 4": 6,
};

export const SORT_OPTIONS: { id: CatalogueSortOption; label: string }[] = [
  { id: "popularity_desc", label: "Most Popular" },
  { id: "flow_desc", label: "Best Fit (Comprehension Flow)" },
  { id: "difficulty_asc", label: "Difficulty: Beginner (A1 → C2)" },
  { id: "difficulty_desc", label: "Difficulty: Advanced (C2 → A1)" },
  { id: "tokens_asc", label: "Length: Shortest First" },
  { id: "tokens_desc", label: "Length: Longest First" },
  { id: "readability_desc", label: "Readability: Easiest First" },
  { id: "dialogue_desc", label: "Dialogue Heavy (High %)" },
  { id: "title_asc", label: "Title: A → Z" },
  { id: "title_desc", label: "Title: Z → A" },
];

export function sortCatalogueItems(
  items: MediaCatalogItem[],
  sortOption: CatalogueSortOption
): MediaCatalogItem[] {
  return [...items].sort((a, b) => {
    const mA = a.metrics;
    const mB = b.metrics;
    const titleA = (a.work_title || a.title || "").toLowerCase();
    const titleB = (b.work_title || b.title || "").toLowerCase();

    switch (sortOption) {
      case "flow_desc": {
        const flowA = a.comprehension?.text_coverage_percentage ?? 0;
        const flowB = b.comprehension?.text_coverage_percentage ?? 0;
        if (flowB !== flowA) return flowB - flowA;
        return (mB?.readability_score || 0) - (mA?.readability_score || 0);
      }
      case "popularity_desc": {
        const popA = a.popularity_score ?? -1;
        const popB = b.popularity_score ?? -1;
        if (popB !== popA) return popB - popA;
        return (b.comprehension?.text_coverage_percentage ?? 0) - (a.comprehension?.text_coverage_percentage ?? 0);
      }
      case "difficulty_asc": {
        const rankA = CEFR_RANK[mA?.cefr_level || "B1"] || 3;
        const rankB = CEFR_RANK[mB?.cefr_level || "B1"] || 3;
        if (rankA !== rankB) return rankA - rankB;
        return (mB?.readability_score || 0) - (mA?.readability_score || 0);
      }
      case "difficulty_desc": {
        const rankA = CEFR_RANK[mA?.cefr_level || "B1"] || 3;
        const rankB = CEFR_RANK[mB?.cefr_level || "B1"] || 3;
        if (rankB !== rankA) return rankB - rankA;
        return (mA?.readability_score || 0) - (mB?.readability_score || 0);
      }
      case "tokens_asc":
        return (mA?.total_tokens || 0) - (mB?.total_tokens || 0);
      case "tokens_desc":
        return (mB?.total_tokens || 0) - (mA?.total_tokens || 0);
      case "readability_desc":
        return (mB?.readability_score || 0) - (mA?.readability_score || 0);
      case "dialogue_desc":
        return (mB?.dialogue_ratio || 0) - (mA?.dialogue_ratio || 0);
      case "title_asc":
        return titleA.localeCompare(titleB);
      case "title_desc":
        return titleB.localeCompare(titleA);
      case "newest":
        return (b.release_year || 0) - (a.release_year || 0);
      default:
        return 0;
    }
  });
}
