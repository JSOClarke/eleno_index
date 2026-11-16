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
    <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
      <div className="md:col-span-5 space-y-1.5">
        <div className="text-xs font-semibold text-slate-500">
          Definitions · {lemma} ({pos.toLowerCase()})
        </div>
        {loadingDefs ? (
          <div className="text-xs text-slate-400 animate-pulse">
            Loading dictionary senses...
          </div>
        ) : resolvedDefs.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-800">
            {resolvedDefs.map((gloss, i) => (
              <li key={i} className="leading-snug">
                {gloss}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-xs text-slate-500">
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
