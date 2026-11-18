import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllUserVocabulary, persistUserWordStatus } from "@/api/vocabulary.api";
import type { UserProfile, UserVocabStatus } from "@/types/vocabulary.types";

const VOCAB_CACHE_PREFIX = "eleno_index_vocab_";

function readCachedVocab(userId?: string, language = "es"): Record<string, UserVocabStatus> {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(`${VOCAB_CACHE_PREFIX}${userId}_${language}`);
    return raw ? (JSON.parse(raw) as Record<string, UserVocabStatus>) : {};
  } catch {
    return {};
  }
}

export function useUserVocabulary(user: UserProfile | null, language = "es") {
  const [statusMap, setStatusMap] = useState<Record<string, UserVocabStatus>>(() =>
    readCachedVocab(user?.id, language)
  );
  const [loading, setLoading] = useState(false);

  const loadVocab = useCallback(async () => {
    if (!user) {
      setStatusMap({});
      return;
    }
    const cached = readCachedVocab(user.id, language);
    setStatusMap(cached);
    setLoading(true);
    try {
      const data = await fetchAllUserVocabulary(user.id, language);
      setStatusMap(data);
      localStorage.setItem(`${VOCAB_CACHE_PREFIX}${user.id}_${language}`, JSON.stringify(data));
    } catch (err) {
      console.error("[useUserVocabulary] Failed to fetch user vocabulary:", err);
    } finally {
      setLoading(false);
    }
  }, [user, language]);

  useEffect(() => {
    loadVocab();
  }, [loadVocab]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") loadVocab();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user, loadVocab]);

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
        localStorage.setItem(`${VOCAB_CACHE_PREFIX}${user.id}_${language}`, JSON.stringify(next));
        return next;
      });

      try {
        await persistUserWordStatus(user.id, canonicalId, status);
      } catch (err) {
        console.error("[useUserVocabulary] Failed to persist word status:", err);
        loadVocab();
      }
    },
    [user, language, loadVocab]
  );

  const knownCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === "known").length,
    [statusMap]
  );

  const learningCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === "learning").length,
    [statusMap]
  );

  return {
    statusMap,
    knownCount,
    learningCount,
    loading,
    setWordStatus,
    reloadVocab: loadVocab,
  };
}
