import { supabase } from "@/lib/supabase";
import type { ChapterAudioSync } from "@/types/readerAudio.types";

const BUCKET = "media-reader";

export async function fetchChapterAudioSync(
  mediaItemId: string,
  chapterIndex: number
): Promise<ChapterAudioSync | null> {
  try {
    const syncPath = `${mediaItemId}/audio/ch_${chapterIndex}_sync.json`;
    const { data: syncUrlData } = supabase.storage.from(BUCKET).getPublicUrl(syncPath);

    const res = await fetch(`${syncUrlData.publicUrl}?t=${Date.now()}`, { cache: "no-cache" });
    if (!res.ok) {
      return null;
    }

    const syncData: ChapterAudioSync = await res.json();
    const audioPath = syncData.audio_path || `${mediaItemId}/audio/ch_${chapterIndex}.mp3`;
    const { data: audioUrlData } = supabase.storage.from(BUCKET).getPublicUrl(audioPath);

    return {
      ...syncData,
      audio_url: audioUrlData.publicUrl,
    };
  } catch (err) {
    console.debug(`[readerAudio.api] No audio for ch_${chapterIndex}:`, err);
    return null;
  }
}
