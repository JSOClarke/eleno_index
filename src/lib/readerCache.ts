import { fetchReaderChapter } from "@/api/reader.api";
import type { ElenoReaderChapter } from "@/types/reader.types";

const memoryCache = new Map<string, ElenoReaderChapter>();
const pendingRequests = new Map<string, Promise<ElenoReaderChapter>>();

function makeKey(mediaItemId: string, chapterIndex: number): string {
  return `${mediaItemId}:${chapterIndex}`;
}

export async function getCachedChapter(
  mediaItemId: string,
  chapterIndex: number,
  totalChapters?: number
): Promise<ElenoReaderChapter> {
  const key = makeKey(mediaItemId, chapterIndex);

  if (memoryCache.has(key)) {
    if (totalChapters && chapterIndex < totalChapters) {
      prefetchChapter(mediaItemId, chapterIndex + 1);
    }
    return memoryCache.get(key)!;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const req = fetchReaderChapter(mediaItemId, chapterIndex)
    .then((chapter) => {
      memoryCache.set(key, chapter);
      pendingRequests.delete(key);
      if (totalChapters && chapterIndex < totalChapters) {
        prefetchChapter(mediaItemId, chapterIndex + 1);
      }
      return chapter;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, req);
  return req;
}

export function prefetchChapter(mediaItemId: string, chapterIndex: number): void {
  const key = makeKey(mediaItemId, chapterIndex);
  if (memoryCache.has(key) || pendingRequests.has(key)) return;

  const req = fetchReaderChapter(mediaItemId, chapterIndex)
    .then((chapter) => {
      memoryCache.set(key, chapter);
      pendingRequests.delete(key);
      return chapter;
    })
    .catch(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, req as any);
}

export function clearReaderCache(mediaItemId?: string): void {
  if (mediaItemId) {
    const prefix = `${mediaItemId}:`;
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  } else {
    memoryCache.clear();
  }
}
