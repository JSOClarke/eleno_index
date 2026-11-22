import { delIdbValue, getIdbValue, setIdbValue } from "@/lib/idbCache";
import type {
  EpubBook,
  EpubBookMeta,
  EpubProgress,
  EpubSettings,
  ParsedBlockResult,
} from "@/types/epubReader.types";

const SHELF_KEY = "epub_shelf_v1";
const SETTINGS_KEY = "epub_settings_v1";
const BOOK_PREFIX = "epub_book_v1:";
const PROGRESS_PREFIX = "epub_progress_v1:";
const PARSED_PREFIX = "epub_parsed_v1:";

export const DEFAULT_EPUB_SETTINGS: EpubSettings = {
  theme: "light",
  fontSize: 18,
  scrollMode: "scroll",
  highlightUnknown: true,
  highlightMode: "status",
  autoParse: true,
};

export async function listEpubShelf(): Promise<EpubBookMeta[]> {
  const list = await getIdbValue<EpubBookMeta[]>(SHELF_KEY);
  return Array.isArray(list) ? list : [];
}

export async function saveEpubBook(book: EpubBook): Promise<void> {
  const shelf = await listEpubShelf();
  const meta: EpubBookMeta = {
    id: book.id,
    title: book.title,
    author: book.author,
    language: book.language,
    coverUrl: book.coverUrl,
    chapterCount: book.chapterCount,
    addedAt: book.addedAt,
  };
  const next = [meta, ...shelf.filter((b) => b.id !== book.id)];
  await Promise.all([setIdbValue(SHELF_KEY, next), setIdbValue(`${BOOK_PREFIX}${book.id}`, book)]);
}

export async function loadEpubBook(bookId: string): Promise<EpubBook | null> {
  return getIdbValue<EpubBook>(`${BOOK_PREFIX}${bookId}`);
}

export async function deleteEpubBook(bookId: string): Promise<void> {
  const shelf = await listEpubShelf();
  await Promise.all([
    setIdbValue(SHELF_KEY, shelf.filter((b) => b.id !== bookId)),
    delIdbValue(`${BOOK_PREFIX}${bookId}`),
    delIdbValue(`${PROGRESS_PREFIX}${bookId}`),
  ]);
}

export async function loadEpubProgress(bookId: string): Promise<EpubProgress> {
  const stored = await getIdbValue<EpubProgress>(`${PROGRESS_PREFIX}${bookId}`);
  return stored || { chapterIndex: 0, pageIndex: 0, scrollTop: 0, updatedAt: Date.now() };
}

export async function saveEpubProgress(bookId: string, progress: EpubProgress): Promise<void> {
  await setIdbValue(`${PROGRESS_PREFIX}${bookId}`, progress);
}

export async function loadParsedChapter(bookId: string, chapterIndex: number): Promise<ParsedBlockResult[] | null> {
  return getIdbValue<ParsedBlockResult[]>(`${PARSED_PREFIX}${bookId}:${chapterIndex}`);
}

export async function saveParsedChapter(
  bookId: string,
  chapterIndex: number,
  blocks: ParsedBlockResult[]
): Promise<void> {
  await setIdbValue(`${PARSED_PREFIX}${bookId}:${chapterIndex}`, blocks);
}

export function loadEpubSettings(): EpubSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_EPUB_SETTINGS, ...JSON.parse(raw) } : DEFAULT_EPUB_SETTINGS;
  } catch {
    return DEFAULT_EPUB_SETTINGS;
  }
}

export function saveEpubSettings(settings: EpubSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore restricted storage
  }
}
