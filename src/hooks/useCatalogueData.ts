import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBaseCatalogueItems,
  fetchCatalogueEnrichment,
  fetchMediaComprehensionMap,
} from "@/api/catalogue.api";
import { readCachedCatalogue, writeCachedCatalogue } from "@/lib/catalogueCache";
import { applyOptimisticBookDelta } from "@/lib/optimisticMath";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export function useCatalogueData(userId?: string | null, authLoading = false) {
  const [items, setItems] = useState<MediaCatalogItem[]>(() => readCachedCatalogue());
  const [loading, setLoading] = useState<boolean>(() => readCachedCatalogue().length === 0);
  const [error, setError] = useState<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCatalogue = useCallback(async () => {
    setError(null);
    const tStart = performance.now();
    try {
      const baseItems = await fetchBaseCatalogueItems();
      setItems((prev) => {
        const prevMap = new Map(prev.map((p) => [p.id, p]));
        const merged = baseItems.map((b) => {
          const cached = prevMap.get(b.id);
          return cached
            ? {
                ...b,
                comprehension: cached.comprehension,
                previewWords: cached.previewWords,
              }
            : b;
        });
        writeCachedCatalogue(merged);
        return merged;
      });
      setLoading(false);
      console.info(
        `[index /es] Stage 1 Cards + Covers rendered in ${Math.round(
          performance.now() - tStart
        )}ms`
      );

      const { compMap, previewLookup } = await fetchCatalogueEnrichment(userId);
      const enriched = baseItems.map((b) => ({
        ...b,
        comprehension: compMap[b.id] || null,
        previewWords: previewLookup[b.id] || [],
      }));
      setItems(enriched);
      writeCachedCatalogue(enriched);
      console.info(
        `[index /es] Stage 2 RPC Enrichment complete in ${Math.round(
          performance.now() - tStart
        )}ms`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalogue");
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    loadCatalogue();
  }, [authLoading, loadCatalogue]);

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

  return { items, loading, error, reloadCatalogue: loadCatalogue, applyOptimisticWordToggle };
}
