import { useCallback, useEffect, useState } from "react";
import { useReaderProgressRestore } from "@/hooks/useReaderProgressRestore";
import { useReaderProgressSaver } from "@/hooks/useReaderProgressSaver";
import { getCachedChapter } from "@/lib/readerCache";
import { clampFontSize, persistReaderPrefs, readReaderPrefs } from "@/lib/readerPrefs";
import type {
  ElenoLexiconEntry,
  ElenoReaderChapter,
  ElenoReaderManifest,
  HighlightMode,
  ProgressSyncState,
  RubyPosFilter,
  TrackedLexiconEntry,
} from "@/types/reader.types";

export interface SelectedTokenState {
  surface: string;
  entry: TrackedLexiconEntry;
  morph?: string;
  blockIndex: number;
  sentenceIndex: number;
}

export function useReaderSession(
  mediaItemId: string,
  manifest: ElenoReaderManifest | null
) {
  const [chapterIndex, setChapterIndexState] = useState<number>(1);
  const [chapter, setChapter] = useState<ElenoReaderChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialPrefs] = useState(() => readReaderPrefs());
  const [showRuby, setShowRuby] = useState<boolean>(initialPrefs.showRuby);
  const [rubyPos, setRubyPos] = useState<RubyPosFilter>(initialPrefs.rubyPos);
  const [showIPlusOne, setShowIPlusOne] = useState<boolean>(initialPrefs.showIPlusOne);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>(initialPrefs.highlightMode);
  const [highlightUnknownOnly, setHighlightUnknownOnly] = useState<boolean>(
    initialPrefs.highlightUnknownOnly
  );
  const [fontSize, setFontSize] = useState<number>(initialPrefs.fontSize);
  const [selectedToken, setSelectedToken] = useState<SelectedTokenState | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [savedPercentage, setSavedPercentage] = useState<number>(0);
  const [progressSync, setProgressSync] = useState<ProgressSyncState>("idle");

  const setChapterIndex = useCallback((next: number | ((previous: number) => number)) => {
    setCurrentBlockIndex(0);
    setChapterIndexState(next);
  }, []);

  const { recordPosition: saveProgress, resetHighWater } = useReaderProgressSaver({
    mediaItemId,
    chapterIndex,
    chapterBlockCount: chapter?.blocks.length || 1,
    manifest,
    onSyncChange: setProgressSync,
    onSaved: setSavedPercentage,
  });

  const recordPosition = useCallback(
    (blockIdx: number) => {
      setCurrentBlockIndex(blockIdx);
      saveProgress(blockIdx);
    },
    [saveProgress]
  );

  const progressReady = useReaderProgressRestore(mediaItemId, (progress) => {
    if (progress.chapter_index > 0) setChapterIndexState(progress.chapter_index);
    if (progress.block_index >= 0) {
      setCurrentBlockIndex(progress.block_index);
      resetHighWater(progress.chapter_index, progress.block_index);
    }
    if (progress.percentage > 0) setSavedPercentage(progress.percentage);
  });

  useEffect(() => {
    persistReaderPrefs({ fontSize, showRuby, rubyPos, showIPlusOne, highlightMode, highlightUnknownOnly });
  }, [fontSize, showRuby, rubyPos, showIPlusOne, highlightMode, highlightUnknownOnly]);


  // Load chapter
  useEffect(() => {
    if (!manifest || !chapterIndex || !progressReady) return;
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
  }, [mediaItemId, chapterIndex, manifest, progressReady]);

  const selectToken = useCallback(
    (surface: string, entry: ElenoLexiconEntry, bIdx: number, sIdx: number, morph?: string) => {
      if (!entry.id) return;
      setSelectedToken({
        surface,
        entry: { ...entry, id: entry.id },
        morph,
        blockIndex: bIdx,
        sentenceIndex: sIdx,
      });
    },
    []
  );

  const closeDock = useCallback(() => setSelectedToken(null), []);

  const adjustFontSize = useCallback((delta: number) => {
    setFontSize((previous) => clampFontSize(previous + delta));
  }, []);

  return {
    chapterIndex,
    setChapterIndex,
    chapter,
    loading,
    error,
    showRuby,
    setShowRuby,
    rubyPos,
    setRubyPos,
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
    savedPercentage,
    progressSync,
    fontSize,
    adjustFontSize,
  };
}
