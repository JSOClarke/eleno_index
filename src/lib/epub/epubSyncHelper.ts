import { fetchRemoteShelf, upsertRemoteBook } from "@/api/epubLibrary.api";
import { listEpubShelf, loadEpubBook, loadEpubProgress } from "@/lib/epub/epubLibraryStore";
import type { EpubBookMeta, EpubProgress } from "@/types/epubReader.types";

export async function loadMergedEpubShelf(
  userId?: string | null
): Promise<{ shelf: EpubBookMeta[]; progressMap: Record<string, EpubProgress> }> {
  const localBooks = await listEpubShelf();
  const localProgEntries = await Promise.all(localBooks.map(async (b) => [b.id, await loadEpubProgress(b.id)] as const));
  const mergedMap = new Map<string, EpubBookMeta>(localBooks.map((b) => [b.id, b]));
  const progressMap: Record<string, EpubProgress> = Object.fromEntries(localProgEntries);

  if (userId) {
    const remote = await fetchRemoteShelf(userId);
    const remoteIds = new Set(remote.map((r) => r.meta.id));
    for (const { meta, progress } of remote) {
      if (!mergedMap.has(meta.id)) mergedMap.set(meta.id, meta);
      const lp = progressMap[meta.id];
      if (!lp || progress.updatedAt > lp.updatedAt) progressMap[meta.id] = progress;
    }
    for (const lb of localBooks) {
      if (!remoteIds.has(lb.id)) {
        const full = await loadEpubBook(lb.id);
        if (full) void upsertRemoteBook(userId, full);
      }
    }
  }

  return {
    shelf: Array.from(mergedMap.values()).sort((a, b) => b.addedAt - a.addedAt),
    progressMap,
  };
}
