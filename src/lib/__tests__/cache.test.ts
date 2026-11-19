import { describe, expect, it, vi, beforeEach } from "vitest";
import { getIdbValue, setIdbValue } from "@/lib/idbCache";
import { buildKnownSignature, readKnownDetailsCache, writeKnownDetailsCache } from "@/lib/knownWordsCache";
import { clearCachedCatalogue, readCachedCatalogue, writeCachedCatalogue } from "@/lib/catalogueCache";
import type { MediaCatalogItem } from "@/types/media.types";
import type { KnownWordEntry } from "@/types/vocabulary.types";

describe("idbCache error visibility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a warning instead of failing silently when IndexedDB is unavailable", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ok = await setIdbValue("test_key", { hello: "world" });
    const val = await getIdbValue("test_key");

    expect(ok).toBe(false);
    expect(val).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe("catalogueCache", () => {
  it("stores and reads large (>5MB) 1000-item catalogues without localStorage truncation", () => {
    clearCachedCatalogue();
    const bigSnippet = "a".repeat(6000);
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: `id-${i}`,
      title: `Book ${i}`,
      creator: "Author",
      language: "es",
      type: "book",
      format: "epub",
      cover_image_url: null,
      release_year: null,
      metrics: null,
      comprehension: null,
      previewWords: [],
      sampleSnippet: bigSnippet,
      sampleSourceLabel: "Excerpt",
    })) as MediaCatalogItem[];

    writeCachedCatalogue(items);
    const read = readCachedCatalogue();
    expect(read).toHaveLength(1000);
    expect(read[999].id).toBe("id-999");
  });
});

describe("knownWordsCache", () => {
  it("detects fresh vs stale statusMap signatures", () => {
    const statusMap = { c1: "known", c2: "learning" } as const;
    const entries = [{ canonical_id: "c1", lemma: "hola", status: "known" }] as KnownWordEntry[];

    writeKnownDetailsCache("user-1", { ...statusMap }, entries, "es");

    const fresh = readKnownDetailsCache("user-1", { ...statusMap }, "es");
    expect(fresh?.isFresh).toBe(true);
    expect(fresh?.entries).toHaveLength(1);

    const stale = readKnownDetailsCache("user-1", { ...statusMap, c3: "known" }, "es");
    expect(stale?.isFresh).toBe(false);

    expect(buildKnownSignature({ c1: "known" })).not.toBe(buildKnownSignature({ c1: "learning" }));
  });
});
