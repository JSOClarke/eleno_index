import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchChapterMetricsWithComprehension,
  fetchFirstVocabPage,
  fetchQuarantineItems,
  fetchRemainingVocabPages,
} from "@/api/inspector.api";
import { fetchMediaComprehensionMap } from "@/api/catalogue.api";
import { applyOptimisticBookDelta } from "@/lib/optimisticMath";
import type {
  MediaCatalogItem,
  MediaChapterMetrics,
  MediaComprehensionStats,
} from "@/types/media.types";
import type {
  QuarantineItem,
  UserVocabStatus,
  VocabularyWord,
} from "@/types/vocabulary.types";

export function useMediaInspector(item: MediaCatalogItem, userId?: string | null) {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [chapterMetrics, setChapterMetrics] = useState<MediaChapterMetrics[]>([]);
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>([]);
  const [quarantineLoading, setQuarantineLoading] = useState(false);
  const [quarantineLoaded, setQuarantineLoaded] = useState(false);
  const [bookComp, setBookComp] = useState<MediaComprehensionStats | null>(
    item.comprehension
  );
  const [loading, setLoading] = useState(true);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBookComp(item.comprehension);
  }, [item.comprehension]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setQuarantineLoaded(false);
    setQuarantineItems([]);

    (async () => {
      try {
        const firstPage = await fetchFirstVocabPage(item.id);
        if (cancelled) return;
        setVocabulary(firstPage);
        setLoading(false);

        const [chapters, restVocab] = await Promise.all([
          fetchChapterMetricsWithComprehension(item.id, userId),
          fetchRemainingVocabPages(item.id, item.metrics?.unique_words_count || 6000),
        ]);
        if (cancelled) return;
        setChapterMetrics(chapters);
        if (restVocab.length > 0) {
          setVocabulary([...firstPage, ...restVocab]);
        }
      } catch (err) {
        console.error("[useMediaInspector] Error loading inspector data:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item.id, item.metrics?.unique_words_count, userId]);

  const loadQuarantine = useCallback(async () => {
    if (quarantineLoaded || quarantineLoading) return;
    setQuarantineLoading(true);
    try {
      const rows = await fetchQuarantineItems(item.id);
      setQuarantineItems(rows);
      setQuarantineLoaded(true);
    } finally {
      setQuarantineLoading(false);
    }
  }, [item.id, quarantineLoaded, quarantineLoading]);

  const handleOptimisticWordChange = useCallback(
    (
      word: VocabularyWord,
      newStatus: UserVocabStatus | null,
      oldStatus: UserVocabStatus | undefined
    ) => {
      const wasKnown = oldStatus === "known";
      const isNowKnown = newStatus === "known";
      if (wasKnown === isNowKnown) return;
      const delta = isNowKnown ? 1 : -1;

      setBookComp((prev) =>
        applyOptimisticBookDelta(prev, item.metrics, delta, word.frequency)
      );

      if (userId) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(async () => {
          const [compMap, freshChapters] = await Promise.all([
            fetchMediaComprehensionMap(userId),
            fetchChapterMetricsWithComprehension(item.id, userId),
          ]);
          if (compMap[item.id]) setBookComp(compMap[item.id]);
          setChapterMetrics(freshChapters);
        }, 1200);
      }
    },
    [item.id, item.metrics, userId]
  );

  return {
    vocabulary,
    chapterMetrics,
    quarantineItems,
    quarantineLoading,
    bookComp,
    loading,
    loadQuarantine,
    handleOptimisticWordChange,
  };
}
