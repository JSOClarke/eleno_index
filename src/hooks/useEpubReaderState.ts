import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteRemoteBook, fetchRemoteBook, fetchRemoteParsedChapter,
  upsertRemoteBook, upsertRemoteParsedChapter, upsertRemoteProgress,
} from "@/api/epubLibrary.api";
import {
  deleteEpubBook, loadEpubBook, loadEpubProgress,
  loadEpubSettings, loadParsedChapter, saveEpubBook, saveEpubProgress,
  saveEpubSettings, saveParsedChapter,
} from "@/lib/epub/epubLibraryStore";
import { loadMergedEpubShelf } from "@/lib/epub/epubSyncHelper";
import { parseEpubFile } from "@/lib/epub/epubParser";
import { parseParagraphSlice } from "@/lib/epub/epubParseClient";
import type {
  EpubBook, EpubBookMeta, EpubProgress, EpubSettings, ParsedBlockResult, SelectedWordContext,
} from "@/types/epubReader.types";

export function useEpubReaderState(userId?: string | null) {
  const [shelf, setShelf] = useState<EpubBookMeta[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, EpubProgress>>({});
  const [activeBook, setActiveBook] = useState<EpubBook | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [parsedBlocks, setParsedBlocks] = useState<Record<number, ParsedBlockResult>>({});
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<EpubSettings>(() => loadEpubSettings());
  const [selected, setSelected] = useState<{ blockIdx: number; ctx: SelectedWordContext } | null>(null);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const parsedRef = useRef<Record<number, ParsedBlockResult>>({});
  const abortRef = useRef<AbortController | null>(null);

  const refreshShelf = useCallback(async () => {
    const { shelf: nextShelf, progressMap: nextProg } = await loadMergedEpubShelf(userId);
    setShelf(nextShelf);
    setProgressMap(nextProg);
  }, [userId]);

  useEffect(() => { void refreshShelf(); }, [refreshShelf]);

  const parseIndices = useCallback(async (indices: number[]) => {
    if (!activeBook) return;
    const ch = activeBook.chapters[chapterIndex];
    if (!ch) return;
    const missing = indices.filter((i) => i >= 0 && i < ch.paragraphs.length && !parsedRef.current[i]);
    if (missing.length === 0) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setParsing(true);
    try {
      for (let s = 0; s < missing.length; s += 30) {
        if (ctrl.signal.aborted) return;
        const batchIdx = missing.slice(s, s + 30);
        const res = await parseParagraphSlice(batchIdx.map((i) => ch.paragraphs[i]), activeBook.language || "es", userId, ctrl.signal);
        batchIdx.forEach((bIdx, offset) => { if (res[offset]) parsedRef.current[bIdx] = res[offset]; });
        setParsedBlocks({ ...parsedRef.current });
      }
      await saveParsedChapter(activeBook.id, chapterIndex, parsedRef.current);
      if (userId) void upsertRemoteParsedChapter(userId, activeBook.id, chapterIndex, parsedRef.current);
    } catch (err: any) {
      if (!ctrl.signal.aborted) console.warn("[epub] Parse error:", err?.message || err);
    } finally {
      if (!ctrl.signal.aborted) setParsing(false);
    }
  }, [activeBook, chapterIndex, userId]);

  useEffect(() => {
    if (!activeBook) return;
    const ch = activeBook.chapters[chapterIndex];
    if (!ch) return;
    abortRef.current?.abort();
    setSelected(null);
    parsedRef.current = {};
    setParsedBlocks({});
    const prog: EpubProgress = { chapterIndex, pageIndex: 0, scrollTop: 0, updatedAt: Date.now() };
    void saveEpubProgress(activeBook.id, prog);
    if (userId) void upsertRemoteProgress(userId, activeBook.id, prog);

    let cancelled = false;
    (async () => {
      let cached = await loadParsedChapter(activeBook.id, chapterIndex);
      if ((!cached || Object.keys(cached).length === 0) && userId) {
        cached = await fetchRemoteParsedChapter(userId, activeBook.id, chapterIndex);
        if (cached && Object.keys(cached).length > 0) await saveParsedChapter(activeBook.id, chapterIndex, cached);
      }
      if (cancelled) return;
      if (cached && Object.keys(cached).length > 0) {
        parsedRef.current = cached;
        setParsedBlocks(cached);
        if (Object.keys(cached).length >= ch.paragraphs.length) return;
      }
      if (settings.autoParse !== false && settings.scrollMode === "scroll") {
        await parseIndices(ch.paragraphs.map((_, i) => i));
      }
    })();
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, [activeBook, chapterIndex, settings.scrollMode, settings.autoParse, userId, parseIndices]);

  useEffect(() => {
    if (!activeBook || settings.autoParse === false || settings.scrollMode !== "paged") return;
    if (visibleIndices.length > 0) void parseIndices(visibleIndices);
  }, [activeBook, settings.autoParse, settings.scrollMode, visibleIndices, parseIndices]);

  const parseCurrentTarget = useCallback(() => {
    if (!activeBook) return;
    const ch = activeBook.chapters[chapterIndex];
    if (!ch) return;
    const target = settings.scrollMode === "paged" && visibleIndices.length > 0 ? visibleIndices : ch.paragraphs.map((_, i) => i);
    void parseIndices(target);
  }, [activeBook, chapterIndex, settings.scrollMode, visibleIndices, parseIndices]);

  const importFile = async (file: File) => {
    setError(null); setImporting(true);
    try {
      const book = await parseEpubFile(file, file.name);
      await saveEpubBook(book);
      if (userId) await upsertRemoteBook(userId, book);
      await refreshShelf();
      setChapterIndex(0); setActiveBook(book);
    } catch (err: any) { setError(err?.message || "Failed to read EPUB file."); }
    finally { setImporting(false); }
  };

  const openBook = async (bookId: string) => {
    let book = await loadEpubBook(bookId);
    if (!book && userId) {
      book = await fetchRemoteBook(userId, bookId);
      if (book) await saveEpubBook(book);
    }
    if (!book) return;
    const prog = progressMap[bookId] || (await loadEpubProgress(bookId));
    setChapterIndex(Math.min(prog.chapterIndex, book.chapters.length - 1));
    setActiveBook(book);
  };

  const removeBook = async (bookId: string) => {
    await deleteEpubBook(bookId);
    if (userId) await deleteRemoteBook(userId, bookId);
    await refreshShelf();
  };
  const updateSettings = (next: EpubSettings) => { setSettings(next); saveEpubSettings(next); };

  return {
    shelf, progressMap, activeBook, setActiveBook, chapterIndex, setChapterIndex,
    parsedBlocks, parsing, importing, error, settings, updateSettings,
    selected, setSelected, refreshShelf, importFile, openBook, removeBook,
    setVisibleIndices, parseCurrentTarget,
  };
}
