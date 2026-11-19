import { getIdbValue, setIdbValue } from "@/lib/idbCache";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";

const KNOWN_DETAILS_CACHE_PREFIX = "eleno_index_known_details_v4_";
const LEGACY_PREFIX = "eleno_index_known_details_v3_";

interface CachedKnownDetails {
  signature: string;
  entries: KnownWordEntry[];
}

const memoryCache = new Map<string, CachedKnownDetails>();

export function buildKnownSignature(statusMap: Record<string, UserVocabStatus>): string {
  const tracked = Object.entries(statusMap)
    .filter(([, s]) => s === "known" || s === "learning")
    .map(([id, s]) => `${id}:${s}`)
    .sort();
  return `${tracked.length}:${tracked.slice(0, 15).join(",")}:${tracked.slice(-15).join(",")}`;
}

export function readKnownDetailsCache(
  userId?: string | null,
  statusMap?: Record<string, UserVocabStatus>,
  language = "es"
): { entries: KnownWordEntry[]; isFresh: boolean } | null {
  if (!userId) return null;
  const cacheKey = `${userId}_${language}`;
  const currentSig = statusMap ? buildKnownSignature(statusMap) : "";
  const mem = memoryCache.get(cacheKey);
  if (mem) {
    return { entries: mem.entries, isFresh: mem.signature === currentSig };
  }
  return null;
}

export async function readKnownDetailsCacheAsync(
  userId?: string | null,
  statusMap?: Record<string, UserVocabStatus>,
  language = "es"
): Promise<{ entries: KnownWordEntry[]; isFresh: boolean } | null> {
  const mem = readKnownDetailsCache(userId, statusMap, language);
  if (mem) return mem;
  if (!userId) return null;
  const cacheKey = `${userId}_${language}`;
  try {
    localStorage.removeItem(`${LEGACY_PREFIX}${cacheKey}`);
  } catch {
    // Ignore restricted localStorage environments
  }
  const stored = await getIdbValue<CachedKnownDetails>(`${KNOWN_DETAILS_CACHE_PREFIX}${cacheKey}`);
  if (!stored || !Array.isArray(stored.entries)) return null;
  memoryCache.set(cacheKey, stored);
  const currentSig = statusMap ? buildKnownSignature(statusMap) : "";
  return { entries: stored.entries, isFresh: stored.signature === currentSig };
}

export function writeKnownDetailsCache(
  userId: string,
  statusMap: Record<string, UserVocabStatus>,
  entries: KnownWordEntry[],
  language = "es"
): void {
  const cacheKey = `${userId}_${language}`;
  const payload: CachedKnownDetails = {
    signature: buildKnownSignature(statusMap),
    entries,
  };
  memoryCache.set(cacheKey, payload);
  void setIdbValue(`${KNOWN_DETAILS_CACHE_PREFIX}${cacheKey}`, payload);
}
