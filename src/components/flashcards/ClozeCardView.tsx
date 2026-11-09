import React from "react";
import { BookOpen } from "lucide-react";
import { ClozeSentenceDisplay } from "./ClozeSentenceDisplay";
import { ClozeInputForm } from "./ClozeInputForm";
import { ClozeFeedbackPanel } from "./ClozeFeedbackPanel";
import { RecognitionSentenceDisplay } from "./RecognitionSentenceDisplay";
import { RecognitionActionPanel } from "./RecognitionActionPanel";
import type { MatchResult } from "@/lib/clozeMatcher";
import type { CardDisplayMode, UserFlashcard } from "@/types/flashcard.types";

interface ClozeCardViewProps {
  card: UserFlashcard;
  cardMode: CardDisplayMode;
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  onReveal: () => void;
  onHint: () => void;
  hintRevealed: boolean;
  feedbackActive: boolean;
  matchResult: MatchResult | null;
  isRevealedWithoutAttempt: boolean;
  onContinue: () => void;
  onGradeRecognition: (isCorrect: boolean) => void;
}

export const ClozeCardView: React.FC<ClozeCardViewProps> = ({
  card,
  cardMode,
  input,
  onInputChange,
  onSubmit,
  onReveal,
  onHint,
  hintRevealed,
  feedbackActive,
  matchResult,
  isRevealedWithoutAttempt,
  onContinue,
  onGradeRecognition,
}) => {
  const targetWord = card.target_surface || card.target_lemma;

  return (
    <div className="bg-white border-2 border-[#111111] p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_#111111]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E2DF] pb-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#666666]">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#111111]">
            {card.source_media_title || "InputHub Library"}
          </span>
          {card.source_context && <span>· {card.source_context}</span>}
        </div>
        <div className="flex items-center gap-2">
          {card.is_i_plus_one && (
            <span className="bg-[#B8FF01] text-[#111111] border border-[#111111] px-1.5 py-0.5 font-bold">
              i+1 MATCH
            </span>
          )}
          <span className="border border-[#111111] px-2 py-0.5 bg-[#F8F8F6] font-bold text-[#111111]">
            SRS Level {card.level}/6
          </span>
          <span className="text-[#888888]">({card.interval_days}d interval)</span>
        </div>
      </div>

      {cardMode === "recognition" ? (
        <div className="space-y-6">
          <RecognitionSentenceDisplay
            sentence={card.sentence}
            targetSurface={card.target_surface}
          />
          <RecognitionActionPanel
            card={card}
            onGrade={onGradeRecognition}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#F8F8F6] border-l-4 border-[#111111] p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
              ENGLISH DEFINITION HINT
            </div>
            <div className="font-sans text-base sm:text-lg font-medium text-[#111111]">
              {card.english_definition}
            </div>
          </div>

          <ClozeSentenceDisplay
            sentence={card.sentence}
            targetSurface={card.target_surface}
            isRevealed={feedbackActive}
            revealedText={card.target_surface}
            feedbackStatus={
              feedbackActive
                ? matchResult?.isMatch && !isRevealedWithoutAttempt
                  ? "correct"
                  : "incorrect"
                : null
            }
          />

          {feedbackActive ? (
            <ClozeFeedbackPanel
              card={card}
              matchResult={matchResult}
              isRevealedWithoutAttempt={isRevealedWithoutAttempt}
              onContinue={onContinue}
            />
          ) : (
            <ClozeInputForm
              input={input}
              onChange={onInputChange}
              onSubmit={onSubmit}
              onReveal={onReveal}
              onHint={onHint}
              hintRevealed={hintRevealed}
              firstLetter={targetWord.charAt(0)}
              wordLength={targetWord.length}
              disabled={feedbackActive}
            />
          )}
        </div>
      )}
    </div>
  );
};
