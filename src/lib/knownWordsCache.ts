import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";

const KNOWN_DETAILS_CACHE_PREFIX = "eleno_index_known_details_v2_";

interface CachedKnownDetails {
  signature: string;
  entries: KnownWordEntry[];
}

const memoryCache = new Map<string, CachedKnownDetails>();

export function buildKnownSignature(statusMap: Record<string, UserVocabStatus>): string {
  const knownIds = Object.entries(statusMap)
    .filter(([, s]) => s === "known")
    .map(([id]) => id)
    .sort();
  return `${knownIds.length}:${knownIds.slice(0, 15).join(",")}:${knownIds.slice(-15).join(",")}`;
}

export function readKnownDetailsCache(
  userId?: string | null,
  statusMap?: Record<string, UserVocabStatus>
): { entries: KnownWordEntry[]; isFresh: boolean } | null {
  if (!userId) return null;
  const currentSig = statusMap ? buildKnownSignature(statusMap) : "";

  const mem = memoryCache.get(userId);
  if (mem) {
    return { entries: mem.entries, isFresh: mem.signature === currentSig };
  }

  try {
    const raw = localStorage.getItem(`${KNOWN_DETAILS_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedKnownDetails;
    if (!parsed || !Array.isArray(parsed.entries)) return null;
    memoryCache.set(userId, parsed);
    return { entries: parsed.entries, isFresh: parsed.signature === currentSig };
  } catch {
    return null;
  }
}

export function writeKnownDetailsCache(
  userId: string,
  statusMap: Record<string, UserVocabStatus>,
  entries: KnownWordEntry[]
): void {
  const payload: CachedKnownDetails = {
    signature: buildKnownSignature(statusMap),
    entries,
  };
  memoryCache.set(userId, payload);
  try {
    localStorage.setItem(`${KNOWN_DETAILS_CACHE_PREFIX}${userId}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}
