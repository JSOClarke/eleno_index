import React, { useEffect, useState } from "react";
import { SentenceBankDrawer } from "@/components/inspector/SentenceBankDrawer";
import { fetchCanonicalGlosses } from "@/api/sentence.api";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface WordContextDrawerProps {
  lemma: string;
  pos: string;
  definitions?: string[];
  canonicalId: string;
  mediaItemId?: string;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  fallbackContextLabel: string;
}

export const WordContextDrawer: React.FC<WordContextDrawerProps> = ({
  lemma,
  pos,
  definitions,
  canonicalId,
  mediaItemId,
  userId,
  statusMap,
  onSetWordStatus,
  fallbackContextLabel,
}) => {
  const [resolvedDefs, setResolvedDefs] = useState<string[]>(definitions || []);
  const [loadingDefs, setLoadingDefs] = useState(!definitions || definitions.length === 0);

  useEffect(() => {
    if (definitions && definitions.length > 0) {
      setResolvedDefs(definitions);
      setLoadingDefs(false);
      return;
    }

    let cancelled = false;
    setLoadingDefs(true);
    fetchCanonicalGlosses([canonicalId])
      .then((glosses) => {
        if (!cancelled) {
          const gloss = glosses[canonicalId];
          setResolvedDefs(gloss?.definitions || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDefs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canonicalId, definitions]);

  return (
    <div className="bg-[#F4F4F2] border-t border-[#E2E2DF] px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
      <div className="md:col-span-5 space-y-1.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#666666]">
          CANONICAL DEFINITIONS · {lemma.toUpperCase()} ({pos})
        </div>
        {loadingDefs ? (
          <div className="font-mono text-xs text-[#777777] animate-pulse">
            Loading dictionary senses...
          </div>
        ) : resolvedDefs.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1 text-xs text-[#111111] font-sans">
            {resolvedDefs.map((gloss, i) => (
              <li key={i} className="leading-snug">
                {gloss}
              </li>
            ))}
          </ol>
        ) : (
          <div className="font-mono text-xs text-[#777777]">
            No dictionary senses recorded for this headword.
          </div>
        )}
      </div>

      <div className="md:col-span-7 space-y-2">
        <SentenceBankDrawer
          canonicalId={canonicalId}
          mediaItemId={mediaItemId}
          userId={userId}
          statusMap={statusMap}
          onSetWordStatus={onSetWordStatus}
          fallbackContextLabel={fallbackContextLabel}
        />
      </div>
    </div>
  );
};
