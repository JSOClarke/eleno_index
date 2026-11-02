import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllUserVocabulary, persistUserWordStatus } from "@/api/vocabulary.api";
import type { UserProfile, UserVocabStatus } from "@/types/vocabulary.types";

export function useUserVocabulary(user: UserProfile | null) {
  const [statusMap, setStatusMap] = useState<Record<string, UserVocabStatus>>({});
  const [loading, setLoading] = useState(false);

  const loadVocab = useCallback(async () => {
    if (!user) {
      setStatusMap({});
      return;
    }
    setLoading(true);
    try {
      const data = await fetchAllUserVocabulary(user.id);
      setStatusMap(data);
    } catch (err) {
      console.error("[useUserVocabulary] Failed to fetch user vocabulary:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVocab();
  }, [loadVocab]);

  const setWordStatus = useCallback(
    async (canonicalId: string, status: UserVocabStatus | null) => {
      if (!user) return;

      setStatusMap((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[canonicalId];
        } else {
          next[canonicalId] = status;
        }
        return next;
      });

      try {
        await persistUserWordStatus(user.id, canonicalId, status);
      } catch (err) {
        console.error("[useUserVocabulary] Failed to persist word status:", err);
        loadVocab();
      }
    },
    [user, loadVocab]
  );

  const knownCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === "known").length,
    [statusMap]
  );

  return {
    statusMap,
    knownCount,
    loading,
    setWordStatus,
    reloadVocab: loadVocab,
  };
}
