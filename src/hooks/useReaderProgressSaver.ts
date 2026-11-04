import { useCallback, useEffect, useRef } from "react";
import { saveReadingProgress } from "@/api/reader.api";
import { bookPercentageForBlock } from "@/lib/readerProgress";
import type { ElenoReaderManifest, ProgressSyncState } from "@/types/reader.types";

interface ReaderProgressSaverParams {
  mediaItemId: string;
  chapterIndex: number;
  chapterBlockCount: number;
  manifest: ElenoReaderManifest | null;
  onSyncChange: (state: ProgressSyncState) => void;
  onSaved: (percentage: number) => void;
}

/**
 * Saves only forward movement (a high-water mark) so scrolling up or the
 * initial observer pass can never erase a restored position.
 */
export function useReaderProgressSaver({
  mediaItemId,
  chapterIndex,
  chapterBlockCount,
  manifest,
  onSyncChange,
  onSaved,
}: ReaderProgressSaverParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highWaterRef = useRef({ chapterIndex: 1, blockIndex: -1 });
  const activeChapterRef = useRef(chapterIndex);

  useEffect(() => {
    activeChapterRef.current = chapterIndex;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chapterIndex]);

  const resetHighWater = useCallback((nextChapter: number, blockIndex: number) => {
    highWaterRef.current = { chapterIndex: nextChapter, blockIndex };
  }, []);

  const recordPosition = useCallback(
    (blockIdx: number) => {
      if (!manifest || manifest.total_chapters <= 0) return;

      if (highWaterRef.current.chapterIndex !== chapterIndex) {
        highWaterRef.current = { chapterIndex, blockIndex: -1 };
      }
      if (blockIdx <= highWaterRef.current.blockIndex) return;
      highWaterRef.current.blockIndex = blockIdx;

      const approxPct = bookPercentageForBlock(
        manifest,
        chapterIndex,
        blockIdx,
        chapterBlockCount
      );

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (activeChapterRef.current !== chapterIndex) return;
        onSyncChange("saving");
        const result = await saveReadingProgress({
          media_item_id: mediaItemId,
          chapter_index: chapterIndex,
          block_index: blockIdx,
          token_index: 0,
          percentage: approxPct,
        });
        if (activeChapterRef.current !== chapterIndex) return;
        onSyncChange(result === "saved" ? "saved" : result === "error" ? "error" : "idle");
        if (result === "saved") onSaved(approxPct);
      }, 1500);
    },
    [
      mediaItemId,
      chapterIndex,
      chapterBlockCount,
      manifest,
      onSyncChange,
      onSaved,
    ]
  );

  return { recordPosition, resetHighWater };
}
