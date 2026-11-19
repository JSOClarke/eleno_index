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
    <div className="bg-slate-50/50 border-t border-slate-200/70 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
      <div className="md:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="font-serif text-lg font-medium tracking-tight text-slate-900">{lemma}</span>
          {pos && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
              {pos}
            </span>
          )}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Definitions</div>
        {loadingDefs ? (
          <div className="space-y-1.5">
            <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        ) : resolvedDefs.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 leading-relaxed">
            {resolvedDefs.slice(0, 6).map((gloss, i) => (
              <li key={i}>{gloss}</li>
            ))}
          </ol>
        ) : (
          <div className="text-xs text-slate-400">No English definition recorded.</div>
        )}
      </div>

      <div className="md:col-span-7">
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
