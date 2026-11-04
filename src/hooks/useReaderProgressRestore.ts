import { useEffect, useRef, useState } from "react";
import { fetchCurrentUserReadingProgress } from "@/api/reader.api";
import type { ReadingProgress } from "@/types/reader.types";

/**
 * Restores the signed-in user's saved position before the reader loads a chapter.
 * Waiting for the auth session prevents an anon read from silently falling back to chapter 1.
 */
export function useReaderProgressRestore(
  mediaItemId: string,
  onRestore: (progress: ReadingProgress) => void
): boolean {
  const [ready, setReady] = useState(false);
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    fetchCurrentUserReadingProgress(mediaItemId)
      .then((progress) => {
        if (cancelled) return;
        if (progress) restoreRef.current(progress);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaItemId]);

  return ready;
}
