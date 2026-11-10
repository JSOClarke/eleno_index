import React from "react";
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
    <article className="bg-white border border-[#111111] p-8 sm:p-10 space-y-8 transition-all">
      {/* Card Metadata Row: Quiet Hairline */}
      <div className="flex items-center justify-between border-b border-[#E8E8E4] pb-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#666666]">
          <span className="font-semibold text-[#111111] tracking-wide">
            {card.source_media_title || "InputHub Library"}
          </span>
          {card.source_context && (
            <>
              <span className="text-[#CCCCCC]">·</span>
              <span className="text-[#888888]">{card.source_context}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {card.is_i_plus_one && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111111] bg-[#B8FF01] px-1.5 py-0.5 border border-[#9FE000]">
              i+1 MATCH
            </span>
          )}
          <span className="text-[#888888]">·</span>
          <span className="text-[#555555] font-medium">SRS Level {card.level}</span>
          <span className="text-[#AAAAAA]">({card.interval_days}d)</span>
        </div>
      </div>

      {cardMode === "recognition" ? (
        <div className="space-y-8">
          <RecognitionSentenceDisplay
            sentence={card.sentence}
            targetSurface={card.target_surface}
            targetLemma={card.target_lemma}
            targetPos={card.target_pos}
          />
          <RecognitionActionPanel card={card} onGrade={onGradeRecognition} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="border-l-2 border-[#111111] pl-4 py-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
              TARGET MEANING (PRODUCTION CUE)
            </div>
            <div className="font-sans text-xl sm:text-2xl font-bold text-[#111111]">
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

          {!feedbackActive ? (
            <ClozeInputForm
              input={input}
              onChange={onInputChange}
              onSubmit={onSubmit}
              onReveal={onReveal}
              onHint={onHint}
              hintRevealed={hintRevealed}
              firstLetter={targetWord ? targetWord[0] : ""}
              wordLength={targetWord ? targetWord.length : 0}
              disabled={feedbackActive}
            />
          ) : (
            <ClozeFeedbackPanel
              matchResult={matchResult}
              card={card}
              isRevealedWithoutAttempt={isRevealedWithoutAttempt}
              onContinue={onContinue}
            />
          )}
        </div>
      )}
    </article>
  );
};
