import { supabase } from "@/lib/supabase";
import type {
  EpubBook,
  EpubBookMeta,
  EpubProgress,
  ParsedBlockResult,
} from "@/types/epubReader.types";

export interface RemoteShelfEntry {
  meta: EpubBookMeta;
  progress: EpubProgress;
}

export async function fetchRemoteShelf(userId: string): Promise<RemoteShelfEntry[]> {
  const { data, error } = await supabase
    .from("user_epub_books")
    .select("id,title,author,language,cover_url,chapter_count,chapter_index,page_index,scroll_top,block_index,added_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("[epubLibrary] fetchRemoteShelf failed:", error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    meta: {
      id: String(row.id),
      title: String(row.title),
      author: String(row.author || "Unknown Author"),
      language: String(row.language || "es"),
      coverUrl: row.cover_url || null,
      chapterCount: Number(row.chapter_count || 0),
      addedAt: Number(row.added_at || Date.now()),
    },
    progress: {
      chapterIndex: Number(row.chapter_index || 0),
      pageIndex: Number(row.page_index || 0),
      scrollTop: Number(row.scroll_top || 0),
      blockIndex: Number(row.block_index || 0),
      updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    },
  }));
}

export async function fetchRemoteBook(userId: string, bookId: string): Promise<EpubBook | null> {
  const { data, error } = await supabase
    .from("user_epub_books")
    .select("id,title,author,language,cover_url,chapter_count,chapters,added_at")
    .eq("user_id", userId)
    .eq("id", bookId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: String(data.id),
    title: String(data.title),
    author: String(data.author || "Unknown Author"),
    language: String(data.language || "es"),
    coverUrl: data.cover_url || null,
    chapterCount: Number(data.chapter_count || 0),
    addedAt: Number(data.added_at || Date.now()),
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
  };
}

export async function upsertRemoteBook(userId: string, book: EpubBook): Promise<void> {
  const { error } = await supabase.from("user_epub_books").upsert(
    {
      user_id: userId,
      id: book.id,
      title: book.title,
      author: book.author,
      language: book.language,
      cover_url: book.coverUrl,
      chapter_count: book.chapterCount,
      chapters: book.chapters,
      added_at: book.addedAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,id" }
  );
  if (error) console.warn("[epubLibrary] upsertRemoteBook failed:", error.message);
}

export async function deleteRemoteBook(userId: string, bookId: string): Promise<void> {
  const { error } = await supabase.from("user_epub_books").delete().eq("user_id", userId).eq("id", bookId);
  if (error) console.warn("[epubLibrary] deleteRemoteBook failed:", error.message);
}

export async function upsertRemoteProgress(userId: string, bookId: string, p: EpubProgress): Promise<void> {
  const { error } = await supabase
    .from("user_epub_books")
    .update({
      chapter_index: p.chapterIndex,
      page_index: p.pageIndex,
      scroll_top: p.scrollTop,
      block_index: p.blockIndex ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", bookId);
  if (error) console.warn("[epubLibrary] upsertRemoteProgress failed:", error.message);
}

export async function fetchRemoteParsedChapter(
  userId: string,
  bookId: string,
  chapterIndex: number
): Promise<Record<number, ParsedBlockResult> | null> {
  const { data, error } = await supabase
    .from("user_epub_parsed_chapters")
    .select("blocks")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("chapter_index", chapterIndex)
    .maybeSingle();

  if (error || !data?.blocks) return null;
  if (Array.isArray(data.blocks)) {
    return Object.fromEntries(data.blocks.map((b: ParsedBlockResult, i: number) => [i, b]));
  }
  return data.blocks as Record<number, ParsedBlockResult>;
}

export async function upsertRemoteParsedChapter(
  userId: string,
  bookId: string,
  chapterIndex: number,
  blocks: Record<number, ParsedBlockResult>
): Promise<void> {
  const { error } = await supabase.from("user_epub_parsed_chapters").upsert(
    {
      user_id: userId,
      book_id: bookId,
      chapter_index: chapterIndex,
      blocks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id,chapter_index" }
  );
  if (error) console.warn("[epubLibrary] upsertRemoteParsedChapter failed:", error.message);
}
