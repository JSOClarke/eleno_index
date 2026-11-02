import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchChapterMetricsWithComprehension,
  fetchFirstVocabPage,
  fetchQuarantineItems,
  fetchRemainingVocabPages,
} from "@/api/inspector.api";
import { fetchMediaComprehensionMap } from "@/api/catalogue.api";
import { inspectorCache } from "@/lib/inspectorCache";
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
  const cached = inspectorCache.get(item.id);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(cached?.vocabulary || []);
  const [chapterMetrics, setChapterMetrics] = useState<MediaChapterMetrics[]>(
    cached?.chapterMetrics || []
  );
  const [chaptersLoading, setChaptersLoading] = useState(!cached?.chapterMetrics.length);
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>(
    cached?.quarantineItems || []
  );
  const [quarantineLoading, setQuarantineLoading] = useState(false);
  const [quarantineLoaded, setQuarantineLoaded] = useState(!!cached?.quarantineLoaded);
  const [bookComp, setBookComp] = useState<MediaComprehensionStats | null>(item.comprehension);
  const [loading, setLoading] = useState(!cached?.vocabulary.length);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBookComp(item.comprehension);
  }, [item.comprehension]);

  useEffect(() => {
    let cancelled = false;
    const hit = inspectorCache.get(item.id);
    if (hit?.isComplete) {
      setVocabulary(hit.vocabulary);
      setChapterMetrics(hit.chapterMetrics);
      setQuarantineItems(hit.quarantineItems);
      setQuarantineLoaded(hit.quarantineLoaded);
      setLoading(false);
      setChaptersLoading(false);
      return;
    }

    setLoading(true);
    setChaptersLoading(true);

    (async () => {
      try {
        const [firstPage, chapters] = await Promise.all([
          fetchFirstVocabPage(item.id),
          fetchChapterMetricsWithComprehension(item.id, userId),
        ]);
        if (cancelled) return;
        setVocabulary(firstPage);
        setChapterMetrics(chapters);
        setLoading(false);
        setChaptersLoading(false);

        const restVocab = await fetchRemainingVocabPages(
          item.id,
          item.metrics?.unique_words_count || 2000
        );
        if (cancelled) return;
        const fullVocab = restVocab.length > 0 ? [...firstPage, ...restVocab] : firstPage;
        setVocabulary(fullVocab);

        inspectorCache.set(item.id, {
          vocabulary: fullVocab,
          chapterMetrics: chapters,
          quarantineItems: inspectorCache.get(item.id)?.quarantineItems || [],
          quarantineLoaded: inspectorCache.get(item.id)?.quarantineLoaded || false,
          isComplete: true,
        });
      } catch (err) {
        console.error("[useMediaInspector] Error loading inspector data:", err);
        if (!cancelled) {
          setLoading(false);
          setChaptersLoading(false);
        }
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
      const existing = inspectorCache.get(item.id);
      if (existing) {
        inspectorCache.set(item.id, { ...existing, quarantineItems: rows, quarantineLoaded: true });
      }
    } finally {
      setQuarantineLoading(false);
    }
  }, [item.id, quarantineLoaded, quarantineLoading]);

  const handleOptimisticWordChange = useCallback(
    (word: VocabularyWord, newStatus: UserVocabStatus | null, oldStatus?: UserVocabStatus) => {
      const wasKnown = oldStatus === "known";
      const isNowKnown = newStatus === "known";
      if (wasKnown === isNowKnown) return;
      const delta = isNowKnown ? 1 : -1;

      setBookComp((prev) => applyOptimisticBookDelta(prev, item.metrics, delta, word.frequency));

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
    chaptersLoading,
    quarantineItems,
    quarantineLoading,
    bookComp,
    loading,
    loadQuarantine,
    handleOptimisticWordChange,
  };
}
