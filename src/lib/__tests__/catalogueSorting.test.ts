import { describe, it, expect } from "vitest";
import { sortCatalogueItems } from "../catalogueSorting";
import type { MediaCatalogItem } from "@/types/media.types";

function makeItem(
  id: string,
  popularity_score: number | null | undefined,
  flowPct = 0
): MediaCatalogItem {
  return {
    id,
    type: "book",
    title: id,
    creator: "Author",
    language: "es",
    format: "epub",
    cover_image_url: null,
    release_year: 2020,
    popularity_score,
    metrics: null,
    comprehension: {
      media_item_id: id,
      total_words: 100,
      known_words: flowPct,
      comprehension_percentage: flowPct,
      total_tokens: 1000,
      known_tokens: flowPct * 10,
      text_coverage_percentage: flowPct,
    },
    previewWords: [],
    sampleSnippet: null,
    sampleSourceLabel: "Archive",
  };
}

describe("sortCatalogueItems popularity_desc", () => {
  it("orders higher popularity_score first and puts unscored items last", () => {
    const items = [
      makeItem("unscored", null, 95),
      makeItem("mid", 55.2, 70),
      makeItem("top", 87.45, 60),
      makeItem("low", 12.0, 90),
    ];

    const sorted = sortCatalogueItems(items, "popularity_desc");
    expect(sorted.map((x) => x.id)).toEqual(["top", "mid", "low", "unscored"]);
  });

  it("breaks equal popularity ties by comprehension flow", () => {
    const items = [
      makeItem("lower-flow", 60, 65),
      makeItem("higher-flow", 60, 88),
    ];

    const sorted = sortCatalogueItems(items, "popularity_desc");
    expect(sorted.map((x) => x.id)).toEqual(["higher-flow", "lower-flow"]);
  });
});
