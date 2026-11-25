import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchCanonicalGlosses } from "@/api/sentence.api";
import { formatMorphology } from "@/lib/grammarFormatters";
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
  token, status, onClose, onSetWordStatus, onAfterChange,
}) => {
  const [gloss, setGloss] = useState<CanonicalGloss | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllDefs, setShowAllDefs] = useState(false);

  useEffect(() => {
    setShowAllDefs(false);
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

  const toggle = (target: "known" | "learning") => {
    const canonicalId = token.canonical_id as string;
    onSetWordStatus(canonicalId, status === target ? null : target);
    onAfterChange?.();
  };

  const lemma = gloss?.lemma || token.lemma || token.surface;
  const pos = gloss?.pos || token.pos || "";
  const morphLabel = formatMorphology(token.morph || undefined);
  const morphChips = morphLabel ? morphLabel.split(" · ").filter(Boolean) : [];
  const defs = gloss?.definitions || [];
  const visibleDefs = showAllDefs ? defs : defs.slice(0, 4);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {token.surface.toLowerCase() !== lemma.toLowerCase() && (
              <span className="text-xs font-medium text-slate-400">{token.surface} →</span>
            )}
            <span className="text-sm font-semibold text-slate-900">{lemma}</span>
            {pos && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {pos}
              </span>
            )}
          </div>
          {morphChips.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {morphChips.map((chip) => (
                <span key={chip} className="rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={onClose} title="Close token definition"
          className="rounded-lg p-1 border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-xs text-slate-700">
        {loading ? (
          <div className="h-3.5 w-3/4 rounded bg-slate-200 animate-pulse" />
        ) : visibleDefs.length > 0 ? (
          <div className="space-y-1">
            <ol className="space-y-1 leading-snug">
              {visibleDefs.map((def, idx) => (
                <li key={idx} className="flex items-baseline gap-2">
                  <span className="text-[10px] font-semibold tabular-nums text-slate-400 shrink-0">{idx + 1}.</span>
                  <span>{def}</span>
                </li>
              ))}
            </ol>
            {defs.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllDefs((v) => !v)}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer pt-0.5"
              >
                {showAllDefs ? "Show fewer" : `Show all ${defs.length} senses`}
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            No dictionary senses recorded for this token.
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px]">
        {(["learning", "known"] as const).map((target) => {
          const active = status === target;
          return (
            <button key={target} type="button" onClick={() => toggle(target)} aria-pressed={active}
              className={`rounded-lg px-2.5 py-1 border font-medium transition cursor-pointer ${
                active
                  ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}>
              {target === "learning" ? "Learn" : "Known"}
            </button>
          );
        })}
      </div>
    </div>
  );
};
