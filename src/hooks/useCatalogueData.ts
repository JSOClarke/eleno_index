import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCatalogueItems, fetchMediaComprehensionMap } from "@/api/catalogue.api";
import { applyOptimisticBookDelta } from "@/lib/optimisticMath";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export function useCatalogueData(userId?: string | null) {
  const [items, setItems] = useState<MediaCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCatalogueItems(userId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalogue");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  const applyOptimisticWordToggle = useCallback(
    (
      mediaItemId: string,
      wordFrequency: number,
      newStatus: UserVocabStatus | null,
      oldStatus: UserVocabStatus | undefined
    ) => {
      const wasKnown = oldStatus === "known";
      const isNowKnown = newStatus === "known";
      if (wasKnown === isNowKnown) return;
      const wordsDelta = isNowKnown ? 1 : -1;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== mediaItemId) return item;
          return {
            ...item,
            comprehension: applyOptimisticBookDelta(
              item.comprehension,
              item.metrics,
              wordsDelta,
              wordFrequency
            ),
          };
        })
      );

      if (userId) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(async () => {
          const freshMap = await fetchMediaComprehensionMap(userId);
          setItems((prev) =>
            prev.map((item) =>
              freshMap[item.id] ? { ...item, comprehension: freshMap[item.id] } : item
            )
          );
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
    applyOptimisticWordToggle,
  };
}
