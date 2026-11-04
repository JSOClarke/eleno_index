import { supabase } from "@/lib/supabase";
import type {
  ElenoReaderChapter,
  ElenoReaderManifest,
  ProgressSaveResult,
  ReadingProgress,
} from "@/types/reader.types";
import { normalizeReadingProgress } from "./normalizers";

const BUCKET = "media-reader";

export async function fetchReaderManifest(
  mediaItemId: string
): Promise<ElenoReaderManifest> {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${mediaItemId}/manifest.json`);
  const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, { cache: "no-cache" });
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
  const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load chapter ${chapterIndex} (${res.status})`);
  }
  return await res.json();
}

export async function fetchReadingProgress(
  mediaItemId: string,
  userId: string
): Promise<ReadingProgress | null> {
  const { data, error } = await supabase
    .from("user_reading_progress")
    .select("*")
    .eq("media_item_id", mediaItemId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeReadingProgress(data);
}

/**
 * Waits for the stored auth session before querying progress, so a direct
 * reader load cannot run the query as anon and silently lose the saved chapter.
 */
export async function fetchCurrentUserReadingProgress(
  mediaItemId: string
): Promise<ReadingProgress | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  return fetchReadingProgress(mediaItemId, userId);
}

export async function saveReadingProgress(
  progress: Partial<ReadingProgress> & { media_item_id: string }
): Promise<ProgressSaveResult> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return "skipped";

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
      return "error";
    }
    return "saved";
  } catch (err) {
    console.warn("Failed saving reading progress:", err);
    return "error";
  }
}
