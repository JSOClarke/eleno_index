import { useEffect, useMemo, useState } from "react";
import { applyVocabularyPack, fetchPackApplications, fetchVocabularyPacks, previewVocabularyPack, undoVocabularyPack } from "@/api/packs.api";
import type {
  VocabularyPack,
  VocabularyPackApplication,
  VocabularyPackPreview,
} from "@/types/vocabularyPack.types";

export function useVocabularyPacks(
  userId: string | null | undefined,
  onApplied: () => void | Promise<void>
) {
  const [packs, setPacks] = useState<VocabularyPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VocabularyPack | null>(null);
  const [preview, setPreview] = useState<VocabularyPackPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [latest, setLatest] = useState<VocabularyPackApplication | null>(null);
  const [applications, setApplications] = useState<VocabularyPackApplication[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVocabularyPacks()
      .then((rows) => {
        if (!cancelled) setPacks(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    if (userId) {
      fetchPackApplications(userId).then((apps) => {
        if (!cancelled) {
          setApplications(apps);
          setLatest(apps[0] || null);
        }
      });
    } else {
      setApplications([]);
      setLatest(null);
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const openPreview = async (pack: VocabularyPack) => {
    if (!userId) return;
    setSelected(pack);
    setPreview(null);
    setPreviewLoading(true);
    setMessage(null);
    setError(null);
    try {
      setPreview(await previewVocabularyPack(userId, pack.id));
    } catch {
      setError("Could not preview this pack.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const apply = async (preserveLearning: boolean, preserveIgnored: boolean) => {
    if (!userId || !selected) return;
    setApplying(true);
    setError(null);
    try {
      const result = await applyVocabularyPack(
        userId,
        selected.id,
        preserveLearning,
        preserveIgnored
      );
      setMessage(
        result.changed_count > 0
          ? `Added ${result.changed_count.toLocaleString()} words from ${selected.title}.`
          : `No new words from ${selected.title} needed marking.`
      );
      setSelected(null);
      setPreview(null);
      const apps = await fetchPackApplications(userId);
      setApplications(apps);
      setLatest(apps[0] || null);
      await onApplied();
    } catch {
      setError("Could not apply this pack.");
    } finally {
      setApplying(false);
    }
  };

  const undo = async () => {
    if (!userId || !latest) return;
    setApplying(true);
    setError(null);
    try {
      const reverted = await undoVocabularyPack(userId, latest.id);
      setMessage(`Reverted ${reverted.toLocaleString()} words from the last pack.`);
      const apps = await fetchPackApplications(userId);
      setApplications(apps);
      setLatest(apps[0] || null);
      await onApplied();
    } catch {
      setError("Could not undo the last pack.");
    } finally {
      setApplying(false);
    }
  };

  const closePreview = () => {
    if (!applying) setSelected(null);
  };

  const appliedByPack = useMemo(() => {
    const map: Record<string, VocabularyPackApplication> = {};
    for (const application of applications) {
      if (!map[application.pack_slug]) map[application.pack_slug] = application;
      if (application.pack_id && !map[application.pack_id]) {
        map[application.pack_id] = application;
      }
    }
    return map;
  }, [applications]);

  return {
    packs,
    loading,
    selected,
    preview,
    previewLoading,
    applying,
    latest,
    appliedByPack,
    message,
    error,
    openPreview,
    closePreview,
    apply,
    undo,
  };
}
