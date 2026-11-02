import { supabase } from "@/lib/supabase";
import type {
  ElenoReaderChapter,
  ElenoReaderManifest,
  ReadingProgress,
} from "@/types/reader.types";
import { normalizeReadingProgress } from "./normalizers";

const BUCKET = "media-reader";

export async function fetchReaderManifest(
  mediaItemId: string
): Promise<ElenoReaderManifest> {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${mediaItemId}/manifest.json`);
  const res = await fetch(data.publicUrl);
  if (!res.ok) {
    throw new Error(`Failed to load manifest for media ${mediaItemId} (${res.status})`);
  }
  return await res.json();
}

export async function fetchReaderChapter(
  mediaItemId: string,
  chapterIndex: number
): Promise<ElenoReaderChapter> {
  const path = `${mediaItemId}/ch_${chapterIndex}.json`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const res = await fetch(data.publicUrl);
  if (!res.ok) {
    throw new Error(`Failed to load chapter ${chapterIndex} (${res.status})`);
  }
  return await res.json();
}

export async function fetchReadingProgress(
  mediaItemId: string,
  userId?: string | null
): Promise<ReadingProgress | null> {
  let query = supabase
    .from("user_reading_progress")
    .select("*")
    .eq("media_item_id", mediaItemId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return normalizeReadingProgress(data);
}

export async function saveReadingProgress(
  progress: Partial<ReadingProgress> & { media_item_id: string }
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return;

  const payload: any = {
    user_id: userId,
    media_item_id: progress.media_item_id,
    chapter_index: progress.chapter_index ?? 1,
    block_index: progress.block_index ?? 0,
    token_index: progress.token_index ?? 0,
    percentage: progress.percentage ?? 0,
    bookmarks: progress.bookmarks ?? [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_reading_progress")
    .upsert(payload, { onConflict: "user_id,media_item_id" });

  if (error) {
    console.warn("Failed saving reading progress:", error.message);
  }
}
