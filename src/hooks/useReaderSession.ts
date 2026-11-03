import { useCallback, useEffect, useRef, useState } from "react";
import { fetchReadingProgress, saveReadingProgress } from "@/api/reader.api";
import { getCachedChapter } from "@/lib/readerCache";
import type {
  ElenoLexiconEntry,
  ElenoReaderChapter,
  ElenoReaderManifest,
  HighlightMode,
} from "@/types/reader.types";

export interface SelectedTokenState {
  surface: string;
  entry: ElenoLexiconEntry;
  morph?: string;
  blockIndex: number;
  sentenceIndex: number;
}

export function useReaderSession(
  mediaItemId: string,
  manifest: ElenoReaderManifest | null
) {
  const [chapterIndex, setChapterIndex] = useState<number>(1);
  const [chapter, setChapter] = useState<ElenoReaderChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuby, setShowRuby] = useState<boolean>(true);
  const [showIPlusOne, setShowIPlusOne] = useState<boolean>(false);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("none");
  const [highlightUnknownOnly, setHighlightUnknownOnly] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<SelectedTokenState | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  const saveTimerRef = useRef<any>(null);

  // Initial progress restoration
  useEffect(() => {
    let cancelled = false;
    fetchReadingProgress(mediaItemId).then((prog) => {
      if (cancelled || !prog) return;
      if (prog.chapter_index > 0) setChapterIndex(prog.chapter_index);
      if (prog.block_index >= 0) setCurrentBlockIndex(prog.block_index);
      if (prog.percentage > 0) setPercentage(prog.percentage);
    });
    return () => { cancelled = true; };
  }, [mediaItemId]);

  // Load chapter
  useEffect(() => {
    if (!manifest || !chapterIndex) return;
    setLoading(true);
    setError(null);

    getCachedChapter(mediaItemId, chapterIndex, manifest.total_chapters)
      .then((data) => {
        setChapter(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load chapter");
        setLoading(false);
      });
  }, [mediaItemId, chapterIndex, manifest]);

  const recordPosition = useCallback((blockIdx: number, tokenIdx: number = 0) => {
    setCurrentBlockIndex(blockIdx);
    if (!manifest || manifest.total_chapters <= 0) return;

    const approxPct = Math.min(
      100,
      Math.round(((chapterIndex - 1 + (blockIdx + 1) / (chapter?.blocks.length || 1)) / manifest.total_chapters) * 100)
    );
    setPercentage(approxPct);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveReadingProgress({
        media_item_id: mediaItemId,
        chapter_index: chapterIndex,
        block_index: blockIdx,
        token_index: tokenIdx,
        percentage: approxPct,
      });
    }, 1500);
  }, [mediaItemId, chapterIndex, chapter, manifest]);

  const selectToken = useCallback(
    (surface: string, entry: ElenoLexiconEntry, bIdx: number, sIdx: number, morph?: string) => {
      setSelectedToken({ surface, entry, morph, blockIndex: bIdx, sentenceIndex: sIdx });
    },
    []
  );

  const closeDock = useCallback(() => setSelectedToken(null), []);

  return {
    chapterIndex,
    setChapterIndex,
    chapter,
    loading,
    error,
    showRuby,
    setShowRuby,
    showIPlusOne,
    setShowIPlusOne,
    highlightMode,
    setHighlightMode,
    highlightUnknownOnly,
    setHighlightUnknownOnly,
    selectedToken,
    selectToken,
    closeDock,
    currentBlockIndex,
    recordPosition,
    percentage,
  };
}
