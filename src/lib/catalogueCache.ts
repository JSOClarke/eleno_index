import type { MediaCatalogItem } from "@/types/media.types";

const CACHE_KEY = "eleno_index_catalogue_v3";

export function readCachedCatalogue(): MediaCatalogItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as MediaCatalogItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCachedCatalogue(list: MediaCatalogItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota warnings
  }
}
