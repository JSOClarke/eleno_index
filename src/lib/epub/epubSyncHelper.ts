import {
  deleteRemoteBook, fetchRemoteBook, fetchRemoteParsedChapter,
  fetchRemoteShelf, upsertRemoteBook, upsertRemoteProgress,
} from "@/api/epubLibrary.api";
import {
  deleteEpubBook, listEpubShelf, loadEpubBook, loadEpubProgress,
  loadParsedChapter, saveEpubBook, saveEpubProgress, saveParsedChapter,
} from "@/lib/epub/epubLibraryStore";
import { parseEpubFile } from "@/lib/epub/epubParser";
import type { EpubBook, EpubBookMeta, EpubProgress, ParsedBlockResult } from "@/types/epubReader.types";

export function persistBookPosition(bookId: string, prog: EpubProgress, userId?: string | null): void {
  void saveEpubProgress(bookId, prog);
  if (userId) void upsertRemoteProgress(userId, bookId, prog);
}

export async function loadOrFetchEpubBook(bookId: string, userId?: string | null): Promise<EpubBook | null> {
  let book = await loadEpubBook(bookId);
  if (!book && userId) {
    book = await fetchRemoteBook(userId, bookId);
    if (book) await saveEpubBook(book);
  }
  return book;
}

export async function loadCachedOrRemoteChapter(
  bookId: string, chapterIndex: number, userId?: string | null
): Promise<Record<number, ParsedBlockResult> | null> {
  let cached = await loadParsedChapter(bookId, chapterIndex);
  if ((!cached || Object.keys(cached).length === 0) && userId) {
    cached = await fetchRemoteParsedChapter(userId, bookId, chapterIndex);
    if (cached && Object.keys(cached).length > 0) await saveParsedChapter(bookId, chapterIndex, cached);
  }
  return cached;
}

export async function removeEpubEverywhere(bookId: string, userId?: string | null): Promise<void> {
  await deleteEpubBook(bookId);
  if (userId) await deleteRemoteBook(userId, bookId);
}

export async function importEpubEverywhere(file: File, userId?: string | null): Promise<EpubBook> {
  const book = await parseEpubFile(file, file.name);
  await saveEpubBook(book);
  if (userId) await upsertRemoteBook(userId, book);
  return book;
}

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
