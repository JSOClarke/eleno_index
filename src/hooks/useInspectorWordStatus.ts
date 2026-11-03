import { useCallback } from "react";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface InspectorWordStatusParams {
  mediaItemId: string;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  words: VocabularyWord[];
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onBubbleBookWordToggle: (
    mediaItemId: string,
    wordFrequency: number,
    newStatus: UserVocabStatus | null,
    oldStatus: UserVocabStatus | undefined
  ) => void;
  onOptimisticWordChange: (
    word: VocabularyWord,
    newStatus: UserVocabStatus | null,
    oldStatus?: UserVocabStatus
  ) => void;
}

export function useInspectorWordStatus({
  mediaItemId,
  userId,
  statusMap,
  words,
  onRequireAuth,
  onSetWordStatus,
  onBubbleBookWordToggle,
  onOptimisticWordChange,
}: InspectorWordStatusParams) {
  return useCallback(
    (canonicalId: string, targetStatus: UserVocabStatus | null) => {
      if (!userId) {
        onRequireAuth();
        return;
      }

      const oldStatus = statusMap[canonicalId];
      const newStatus: UserVocabStatus | null =
        targetStatus === null || oldStatus === targetStatus ? null : targetStatus;
      const word = words.find((entry) => entry.canonical_id === canonicalId);

      onSetWordStatus(canonicalId, newStatus);
      if (word) {
        onOptimisticWordChange(word, newStatus, oldStatus);
        onBubbleBookWordToggle(
          mediaItemId,
          word.frequency,
          newStatus,
          oldStatus
        );
      }
    },
    [
      mediaItemId,
      userId,
      statusMap,
      words,
      onRequireAuth,
      onSetWordStatus,
      onBubbleBookWordToggle,
      onOptimisticWordChange,
    ]
  );
}
