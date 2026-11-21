import { delIdbValue, getIdbValue, setIdbValue } from "@/lib/idbCache";
import type { MediaCatalogItem } from "@/types/media.types";

const CACHE_KEY = "eleno_index_catalogue_v7";
const LEGACY_LOCAL_KEY = "eleno_index_catalogue_v3";
let memoryCatalogue: MediaCatalogItem[] = [];

export function readCachedCatalogue(): MediaCatalogItem[] {
  return memoryCatalogue;
}

export async function readCachedCatalogueAsync(): Promise<MediaCatalogItem[]> {
  if (memoryCatalogue.length > 0) return memoryCatalogue;
  try {
    localStorage.removeItem(LEGACY_LOCAL_KEY);
  } catch {
    // Ignore restricted localStorage environments
  }
  const stored = await getIdbValue<MediaCatalogItem[]>(CACHE_KEY);
  if (Array.isArray(stored) && stored.length > 0) {
    memoryCatalogue = stored;
    return stored;
  }
  return [];
}

export function writeCachedCatalogue(list: MediaCatalogItem[]): void {
  memoryCatalogue = list;
  void setIdbValue(CACHE_KEY, list);
}

export function clearCachedCatalogue(): void {
  memoryCatalogue = [];
  void delIdbValue(CACHE_KEY);
}
