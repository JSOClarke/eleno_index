import type { MediaChapterMetrics } from "@/types/media.types";
import type { QuarantineItem, VocabularyWord } from "@/types/vocabulary.types";

export interface InspectorCacheEntry {
  vocabulary: VocabularyWord[];
  chapterMetrics: MediaChapterMetrics[];
  quarantineItems: QuarantineItem[];
  quarantineLoaded: boolean;
  isComplete: boolean;
}

const memoryMap = new Map<string, InspectorCacheEntry>();
const SESSION_PREFIX = "eleno_insp_v1_";

function readSession(mediaId: string): InspectorCacheEntry | null {
  try {
    const raw = sessionStorage.getItem(`${SESSION_PREFIX}${mediaId}`);
    return raw ? (JSON.parse(raw) as InspectorCacheEntry) : null;
  } catch {
    return null;
  }
}

function writeSession(mediaId: string, entry: InspectorCacheEntry): void {
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${mediaId}`, JSON.stringify(entry));
  } catch {
    // Storage quota or private browsing mode
  }
}

export const inspectorCache = {
  get(mediaId: string): InspectorCacheEntry | undefined {
    const mem = memoryMap.get(mediaId);
    if (mem) return mem;
    const sess = readSession(mediaId);
    if (sess) {
      memoryMap.set(mediaId, sess);
      return sess;
    }
    return undefined;
  },

  set(mediaId: string, entry: InspectorCacheEntry): void {
    memoryMap.set(mediaId, entry);
    if (entry.isComplete) {
      writeSession(mediaId, entry);
    }
  },

  delete(mediaId: string): void {
    memoryMap.delete(mediaId);
    try {
      sessionStorage.removeItem(`${SESSION_PREFIX}${mediaId}`);
    } catch {
      // Ignored
    }
  },

  clear(): void {
    memoryMap.clear();
    try {
      sessionStorage.clear();
    } catch {
      // Ignored
    }
  },
};
