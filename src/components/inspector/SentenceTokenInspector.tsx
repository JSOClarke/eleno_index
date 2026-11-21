import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchCanonicalGlosses } from "@/api/sentence.api";
import type { CanonicalGloss, SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface SentenceTokenInspectorProps {
  token: SentenceToken;
  sentenceText?: string;
  sourceContext?: string;
  status?: UserVocabStatus;
  onClose: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onAfterChange?: () => void;
}

export const SentenceTokenInspector: React.FC<SentenceTokenInspectorProps> = ({
  token,
  status,
  onClose,
  onSetWordStatus,
  onAfterChange,
}) => {
  const [gloss, setGloss] = useState<CanonicalGloss | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canonicalId = token.canonical_id;
    if (!canonicalId) {
      setGloss(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchCanonicalGlosses([canonicalId])
      .then((glosses) => {
        if (!cancelled) setGloss(glosses[canonicalId] || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token.canonical_id]);

  if (!token.canonical_id) return null;

  const isLearning = status === "learning";
  const isKnown = status === "known";

  const toggle = (target: "known" | "learning") => {
    const canonicalId = token.canonical_id as string;
    onSetWordStatus(canonicalId, status === target ? null : target);
    onAfterChange?.();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            {gloss?.lemma || token.lemma || token.surface}{" "}
            <span className="text-slate-500 font-normal">({gloss?.pos || token.pos || "—"})</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {token.morph || "No morphology recorded"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          title="Close token definition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-xs text-slate-700">
        {loading ? (
          <div className="h-3.5 w-3/4 rounded bg-slate-200 animate-pulse" />
        ) : gloss && gloss.definitions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-0.5 leading-snug">
            {gloss.definitions.map((def, idx) => (
              <li key={idx}>{def}</li>
            ))}
          </ol>
        ) : (
          <span className="text-[11px] text-slate-500">
            No dictionary senses recorded for this token.
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px]">
        <button
          type="button"
          onClick={() => toggle("learning")}
          aria-pressed={isLearning}
          className={`rounded-lg px-2.5 py-1 border font-medium transition cursor-pointer ${
            isLearning
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Learn
        </button>
        <button
          type="button"
          onClick={() => toggle("known")}
          aria-pressed={isKnown}
          className={`rounded-lg px-2.5 py-1 border font-medium transition cursor-pointer ${
            isKnown
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Known
        </button>
      </div>
    </div>
  );
};
