import React, { useEffect } from "react";
import { CheckCircle2, XCircle, Volume2, ArrowRight } from "lucide-react";
import type { MatchResult } from "@/lib/clozeMatcher";
import type { UserFlashcard } from "@/types/flashcard.types";

interface ClozeFeedbackPanelProps {
  card: UserFlashcard;
  matchResult: MatchResult | null;
  isRevealedWithoutAttempt: boolean;
  onContinue: () => void;
}

export const ClozeFeedbackPanel: React.FC<ClozeFeedbackPanelProps> = ({
  card,
  matchResult,
  isRevealedWithoutAttempt,
  onContinue,
}) => {
  const isCorrect = matchResult?.isMatch && !isRevealedWithoutAttempt;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.target_surface || card.target_lemma);
    u.lang = "es-ES";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const nextIntervalLabel = isCorrect
    ? card.level >= 6
      ? "Mastered! (60d interval)"
      : `Next review: in ${card.interval_days} day${card.interval_days > 1 ? "s" : ""}`
    : "Re-queued for this session (~10m)";

  return (
    <div
      className={`p-5 border-2 transition-all ${
        isCorrect
          ? "border-[#111111] bg-[#F4FFDC]"
          : "border-[#FF3333] bg-[#FFF5F5]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            ) : (
              <XCircle className="w-5 h-5 text-[#D32F2F]" />
            )}
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-[#111111]">
              {isCorrect ? "CORRECT" : isRevealedWithoutAttempt ? "SOLUTION REVEALED" : "INCORRECT"}
            </span>
            {matchResult?.isAccentLenient && (
              <span className="bg-[#B8FF01] text-[#111111] px-2 py-0.5 font-mono text-xs font-semibold border border-[#111111]">
                Accent accepted
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="font-serif text-2xl font-bold text-[#111111]">
              {card.target_surface}
            </span>
            {card.target_surface.toLowerCase() !== card.target_lemma.toLowerCase() && (
              <span className="font-serif text-sm italic text-[#666666]">
                ({card.target_lemma})
              </span>
            )}
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1 border border-[#111111] bg-white hover:bg-[#111111] hover:text-white cursor-pointer transition-colors"
              title="Pronounce"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="font-mono text-xs text-[#555555]">
            <span className="font-bold text-[#111111]">Level {card.level}/6</span> · {nextIntervalLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] text-[#B8FF01] font-mono text-sm font-bold border-2 border-[#111111] hover:bg-[#222222] cursor-pointer shadow-sm transition-colors"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
          <span className="hidden sm:inline text-xs text-[#888888] font-normal">[Space]</span>
        </button>
      </div>
    </div>
  );
};
