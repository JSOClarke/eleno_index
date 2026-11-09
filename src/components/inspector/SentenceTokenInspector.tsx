import React, { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";
import { fetchCanonicalGlosses } from "@/api/sentence.api";
import { upsertWordFlashcard } from "@/api/flashcards.api";
import { useAuth } from "@/hooks/useAuth";
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
  sentenceText,
  sourceContext,
  status,
  onClose,
  onSetWordStatus,
  onAfterChange,
}) => {
  const { user } = useAuth();
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

  const toggle = async (target: "known" | "learning") => {
    const canonicalId = token.canonical_id as string;
    const nextStatus = status === target ? null : target;
    onSetWordStatus(canonicalId, nextStatus);
    onAfterChange?.();

    if (nextStatus === "learning" && user && sentenceText) {
      try {
        await upsertWordFlashcard(user.id, {
          canonical_id: canonicalId,
          sentence: sentenceText,
          target_surface: token.surface,
          target_lemma: gloss?.lemma || token.lemma || token.surface,
          target_pos: gloss?.pos || token.pos || null,
          english_definition: gloss?.definitions?.[0] || token.surface,
          source_context: sourceContext,
        });
      } catch (err) {
        console.warn("Failed to create flashcard:", err);
      }
    }
  };

  return (
    <div className="bg-[#F8F8F6] border border-[#111111] p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs font-bold text-[#111111]">
            {gloss?.lemma || token.lemma || token.surface}{" "}
            <span className="text-[#666666] font-normal">({gloss?.pos || token.pos || "—"})</span>
          </div>
          <div className="font-mono text-[10px] text-[#666666]">
            {token.morph || "NO MORPHOLOGY RECORDED"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 border border-[#111111] bg-white hover:bg-[#B8FF01] cursor-pointer"
          title="Close token definition"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="text-xs text-[#111111]">
        {loading ? (
          <div className="h-3.5 w-3/4 bg-[#DFDFDC] animate-pulse" />
        ) : gloss && gloss.definitions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-0.5 font-sans leading-snug">
            {gloss.definitions.map((def, idx) => (
              <li key={idx}>{def}</li>
            ))}
          </ol>
        ) : (
          <span className="font-mono text-[11px] text-[#666666]">
            No dictionary senses recorded for this token.
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => toggle("learning")}
          className={`inline-flex items-center gap-1 px-2 py-1 border cursor-pointer ${
            isLearning
              ? "border-[#111111] bg-[#B8FF01] text-[#111111] font-semibold"
              : "border-[#CCCCCC] bg-white text-[#555555] hover:border-[#111111]"
          }`}
        >
          {isLearning ? <Zap className="w-3 h-3 fill-current" /> : null}
          <span>{isLearning ? "Learning · SRS" : "Learn"}</span>
        </button>
        <button
          type="button"
          onClick={() => toggle("known")}
          className={`px-2.5 py-1 border cursor-pointer ${
            isKnown
              ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
              : "border-[#111111] bg-white text-[#111111] hover:bg-[#B8FF01]"
          }`}
        >
          {isKnown ? "✓ Known" : "Known"}
        </button>
      </div>
    </div>
  );
};
