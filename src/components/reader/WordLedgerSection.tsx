import React, { useState } from "react";
import { Zap, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { upsertWordFlashcard } from "@/api/flashcards.api";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface WordLedgerSectionProps {
  canonicalId: string;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  surface?: string;
  lemma?: string;
  pos?: string;
  sentence?: string;
  definitions?: string[];
}

export const WordLedgerSection: React.FC<WordLedgerSectionProps> = ({
  canonicalId,
  status,
  onSetStatus,
  surface,
  lemma,
  pos,
  sentence,
  definitions = [],
}) => {
  const { user } = useAuth();
  const [flashcardSaved, setFlashcardSaved] = useState(false);
  const isLearning = status === "learning";
  const isKnown = status === "known";

  const handleToggleLearning = async () => {
    const nextStatus = isLearning ? null : "learning";
    onSetStatus(canonicalId, nextStatus);

    if (nextStatus === "learning" && user && sentence) {
      try {
        await upsertWordFlashcard(user.id, {
          canonical_id: canonicalId,
          sentence,
          target_surface: surface || lemma || "",
          target_lemma: lemma || surface || "",
          target_pos: pos || null,
          english_definition: definitions[0] || lemma || surface || "",
        });
        setFlashcardSaved(true);
        setTimeout(() => setFlashcardSaved(false), 3000);
      } catch (err) {
        console.warn("Failed to create flashcard:", err);
      }
    }
  };

  return (
    <div className="space-y-2 border-t-2 border-[#111111] pt-3">
      <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-[#666666]">
        <span>YOUR VOCABULARY LEDGER</span>
        {flashcardSaved && (
          <span className="flex items-center gap-1 text-[#2E7D32]">
            <Check className="w-3 h-3" /> Flashcard created
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleToggleLearning}
          className={`flex items-center justify-center gap-1 border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer ${
            isLearning ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111]"
          }`}
        >
          {isLearning ? <Zap className="w-3.5 h-3.5 fill-current" /> : null}
          <span>{isLearning ? "Learning · SRS" : "Learn"}</span>
        </button>
        <button
          type="button"
          onClick={() => onSetStatus(canonicalId, isKnown ? null : "known")}
          className={`border border-[#111111] py-2 font-mono text-xs font-bold cursor-pointer ${
            isKnown ? "bg-[#111111] text-white" : "bg-white text-[#111111]"
          }`}
        >
          {isKnown ? "Known ✓" : "Mark Known"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSetStatus(canonicalId, null)}
        className="w-full py-0.5 text-center font-mono text-[10px] text-[#888888] cursor-pointer"
      >
        Reset to Unfamiliar / Default
      </button>
    </div>
  );
};
