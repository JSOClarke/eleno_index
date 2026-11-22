import { useCallback, useEffect, useState } from "react";
import {
  deleteEpubBook,
  listEpubShelf,
  loadEpubBook,
  loadEpubProgress,
  loadEpubSettings,
  loadParsedChapter,
  saveEpubBook,
  saveEpubProgress,
  saveEpubSettings,
  saveParsedChapter,
} from "@/lib/epub/epubLibraryStore";
import { parseEpubFile } from "@/lib/epub/epubParser";
import { parseParagraphSlice } from "@/lib/epub/epubParseClient";
import type {
  EpubBook,
  EpubBookMeta,
  EpubProgress,
  EpubSettings,
  ParsedBlockResult,
  SelectedWordContext,
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

  const refreshShelf = useCallback(async () => {
    const books = await listEpubShelf();
    setShelf(books);
    const entries = await Promise.all(books.map(async (b) => [b.id, await loadEpubProgress(b.id)] as const));
    setProgressMap(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    void refreshShelf();
  }, [refreshShelf]);

  useEffect(() => {
    if (!activeBook) return;
    const ch = activeBook.chapters[chapterIndex];
    if (!ch) return;
    setSelected(null);
    setParsedBlocks({});
    void saveEpubProgress(activeBook.id, { chapterIndex, pageIndex: 0, scrollTop: 0, updatedAt: Date.now() });

    const ctrl = new AbortController();
    (async () => {
      const cached = await loadParsedChapter(activeBook.id, chapterIndex);
      if (ctrl.signal.aborted) return;
      if (cached && cached.length === ch.paragraphs.length) {
        setParsedBlocks(Object.fromEntries(cached.map((b, i) => [i, b])));
        return;
      }
      setParsing(true);
      const nextMap: Record<number, ParsedBlockResult> = {};
      try {
        for (let start = 0; start < ch.paragraphs.length; start += 30) {
          if (ctrl.signal.aborted) return;
          const slice = ch.paragraphs.slice(start, start + 30);
          const res = await parseParagraphSlice(slice, activeBook.language || "es", userId, ctrl.signal);
          res.forEach((b, offset) => { nextMap[start + offset] = b; });
          setParsedBlocks({ ...nextMap });
        }
        const ordered = ch.paragraphs.map((_, i) => nextMap[i]).filter(Boolean);
        if (ordered.length === ch.paragraphs.length) {
          await saveParsedChapter(activeBook.id, chapterIndex, ordered);
        }
      } catch (err: any) {
        if (!ctrl.signal.aborted) console.warn("[epub] Parse error:", err?.message || err);
      } finally {
        if (!ctrl.signal.aborted) setParsing(false);
      }
    })();

    return () => ctrl.abort();
  }, [activeBook, chapterIndex, userId]);

  const importFile = async (file: File) => {
    setError(null);
    setImporting(true);
    try {
      const book = await parseEpubFile(file, file.name);
      await saveEpubBook(book);
      await refreshShelf();
      setChapterIndex(0);
      setActiveBook(book);
    } catch (err: any) {
      setError(err?.message || "Failed to read EPUB file.");
    } finally {
      setImporting(false);
    }
  };

  const openBook = async (bookId: string) => {
    const book = await loadEpubBook(bookId);
    if (!book) return;
    const prog = await loadEpubProgress(bookId);
    setChapterIndex(Math.min(prog.chapterIndex, book.chapters.length - 1));
    setActiveBook(book);
  };

  const removeBook = async (bookId: string) => {
    await deleteEpubBook(bookId);
    await refreshShelf();
  };

  const updateSettings = (next: EpubSettings) => {
    setSettings(next);
    saveEpubSettings(next);
  };

  return {
    shelf, progressMap, activeBook, setActiveBook, chapterIndex, setChapterIndex,
    parsedBlocks, parsing, importing, error, settings, updateSettings,
    selected, setSelected, refreshShelf, importFile, openBook, removeBook,
  };
}
