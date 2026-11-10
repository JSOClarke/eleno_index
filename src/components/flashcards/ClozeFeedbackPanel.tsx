import React, { useEffect } from "react";
import { Volume2, ArrowRight } from "lucide-react";
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
    const mountedAt = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (Date.now() - mountedAt < 250) return;
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
    <div className="space-y-4 pt-2">
      <div className={`p-5 border space-y-3 transition-colors ${
        isCorrect ? "border-[#111111] bg-[#FBFBFA]" : "border-[#D32F2F] bg-[#FFF5F5]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 border ${
              isCorrect ? "bg-[#B8FF01] text-[#111111] border-[#9FE000]" : "bg-[#D32F2F] text-white border-[#D32F2F]"
            }`}>
              {isCorrect ? "✓ EXACT MATCH" : isRevealedWithoutAttempt ? "SOLUTION REVEALED" : "✕ INCORRECT"}
            </span>
            {matchResult?.isAccentLenient && (
              <span className="font-mono text-xs text-[#555555]">Accent accepted</span>
            )}
            <span className="font-mono text-xs text-[#666666]">· {nextIntervalLabel}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2.5 pt-1">
          <span className="font-serif text-2xl font-bold text-[#111111]">
            {card.target_surface}
          </span>
          {card.target_surface.toLowerCase() !== card.target_lemma.toLowerCase() && (
            <span className="font-serif text-base italic text-[#666666]">
              ({card.target_lemma})
            </span>
          )}
          <button
            type="button"
            onClick={handleSpeak}
            className="p-1 hover:bg-[#E8E8E4] text-[#666666] hover:text-[#111111] cursor-pointer"
            title="Pronounce"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="font-sans text-sm text-[#555555]">
          {card.english_definition}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#111111] text-white hover:bg-[#B8FF01] hover:text-[#111111] font-mono text-xs font-bold border border-[#111111] transition-colors cursor-pointer"
      >
        <span>CONTINUE TO NEXT CARD</span>
        <kbd className="bg-[#222222] text-white border-[#444444] px-1.5 py-0.5 text-[10px] font-mono">SPACE / ENTER</kbd>
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </button>
    </div>
  );
};
