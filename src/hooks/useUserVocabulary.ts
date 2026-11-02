import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllUserVocabulary, persistUserWordStatus } from "@/api/vocabulary.api";
import type { UserProfile, UserVocabStatus } from "@/types/vocabulary.types";

const VOCAB_CACHE_PREFIX = "eleno_index_vocab_";

function readCachedVocab(userId?: string): Record<string, UserVocabStatus> {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(`${VOCAB_CACHE_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Record<string, UserVocabStatus>) : {};
  } catch {
    return {};
  }
}

export function useUserVocabulary(user: UserProfile | null) {
  const [statusMap, setStatusMap] = useState<Record<string, UserVocabStatus>>(() =>
    readCachedVocab(user?.id)
  );
  const [loading, setLoading] = useState(false);

  const loadVocab = useCallback(async () => {
    if (!user) {
      setStatusMap({});
      return;
    }
    const cached = readCachedVocab(user.id);
    if (Object.keys(cached).length > 0) {
      setStatusMap(cached);
    }
    setLoading(true);
    try {
      const data = await fetchAllUserVocabulary(user.id);
      setStatusMap(data);
      localStorage.setItem(`${VOCAB_CACHE_PREFIX}${user.id}`, JSON.stringify(data));
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
        localStorage.setItem(`${VOCAB_CACHE_PREFIX}${user.id}`, JSON.stringify(next));
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
