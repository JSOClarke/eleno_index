import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchMediaComprehensionMap,
  fetchPreviewWordsBatch,
} from "@/api/catalogue.api";
import { fetchBaseCatalogueItems } from "@/api/catalogueWorks.api";
import {
  readCachedCatalogue,
  readCachedCatalogueAsync,
  writeCachedCatalogue,
} from "@/lib/catalogueCache";
import { applyOptimisticBookDelta } from "@/lib/optimisticMath";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export function useCatalogueData(userId?: string | null, authLoading = false) {
  const [items, setItems] = useState<MediaCatalogItem[]>(() => readCachedCatalogue());
  const [loading, setLoading] = useState<boolean>(() => readCachedCatalogue().length === 0);
  const [error, setError] = useState<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedPreviewIdsRef = useRef<Set<string>>(new Set());

  const loadCatalogue = useCallback(async () => {
    setError(null);
    loadedPreviewIdsRef.current.clear();
    const tStart = performance.now();
    try {
      const [baseItems, compMap] = await Promise.all([
        fetchBaseCatalogueItems(),
        fetchMediaComprehensionMap(userId),
      ]);
      setItems((prev) => {
        const prevMap = new Map(prev.map((p) => [p.id, p]));
        const enriched = baseItems.map((b) => {
          const cached = prevMap.get(b.id);
          return {
            ...b,
            comprehension: compMap[b.id] || cached?.comprehension || null,
            previewWords: cached?.previewWords || b.previewWords,
          };
        });
        writeCachedCatalogue(enriched);
        return enriched;
      });
      setLoading(false);
      console.info(
        `[inputhub /es] Catalogue + Comprehension loaded in ${Math.round(
          performance.now() - tStart
        )}ms`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalogue");
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    readCachedCatalogueAsync().then((cached) => {
      if (!active || cached.length === 0) return;
      setItems((prev) => (prev.length > 0 ? prev : cached));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadCatalogue();
  }, [authLoading, loadCatalogue]);

  const ensurePreviewWords = useCallback(
    async (mediaIds: string[]) => {
      const missing = mediaIds.filter((id) => id && !loadedPreviewIdsRef.current.has(id));
      if (missing.length === 0) return;
      missing.forEach((id) => loadedPreviewIdsRef.current.add(id));
      try {
        const lookup = await fetchPreviewWordsBatch(userId, missing);
        setItems((prev) => {
          const next = prev.map((item) =>
            lookup[item.id] ? { ...item, previewWords: lookup[item.id] } : item
          );
          writeCachedCatalogue(next);
          return next;
        });
      } catch {
        missing.forEach((id) => loadedPreviewIdsRef.current.delete(id));
      }
    },
    [userId]
  );

  const applyOptimisticWordToggle = useCallback(
    (
      mediaItemId: string,
      wordFrequency: number,
      newStatus: UserVocabStatus | null,
      oldStatus: UserVocabStatus | undefined
    ) => {
      if (oldStatus === newStatus) return;

      setItems((prev) => {
        const next = prev.map((item) =>
          item.id !== mediaItemId
            ? item
            : {
                ...item,
                comprehension: applyOptimisticBookDelta(
                  item.comprehension,
                  item.metrics,
                  wordFrequency,
                  newStatus,
                  oldStatus
                ),
              }
        );
        writeCachedCatalogue(next);
        return next;
      });

      if (userId) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(async () => {
          const freshMap = await fetchMediaComprehensionMap(userId);
          setItems((prev) => {
            const next = prev.map((item) =>
              freshMap[item.id] ? { ...item, comprehension: freshMap[item.id] } : item
            );
            writeCachedCatalogue(next);
            return next;
          });
        }, 1200);
      }
    },
    [userId]
  );

  return {
    items,
    loading,
    error,
    reloadCatalogue: loadCatalogue,
    ensurePreviewWords,
    applyOptimisticWordToggle,
  };
}
