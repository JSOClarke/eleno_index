import React, { useEffect, useState } from "react";
import { Eye, Check, X, Volume2 } from "lucide-react";
import type { UserFlashcard } from "@/types/flashcard.types";

interface RecognitionActionPanelProps {
  card: UserFlashcard;
  onGrade: (isCorrect: boolean) => void;
}

export const RecognitionActionPanel: React.FC<RecognitionActionPanelProps> = ({
  card,
  onGrade,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [revealedAt, setRevealedAt] = useState<number>(0);

  const handleReveal = () => {
    setRevealed(true);
    setRevealedAt(Date.now());
  };

  useEffect(() => {
    setRevealed(false);
    setRevealedAt(0);
  }, [card.canonical_id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!revealed) {
        if (e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          handleReveal();
        }
      } else {
        // Guard against key bleeding within 250ms of reveal
        if (Date.now() - revealedAt < 250) return;
        if (e.key === "1" || e.key.toLowerCase() === "x") {
          e.preventDefault();
          onGrade(false);
        } else if (e.key === "2" || e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          onGrade(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, revealedAt, onGrade]);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.target_surface || card.target_lemma);
    u.lang = "es-ES";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  if (!revealed) {
    return (
      <div className="pt-4 text-center space-y-3">
        <button
          type="button"
          onClick={handleReveal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#111111] text-[#B8FF01] font-mono text-sm font-bold border-2 border-[#111111] hover:bg-[#222222] shadow-[3px_3px_0px_#111111] cursor-pointer transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>REVEAL MEANING</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 bg-[#222222] border border-[#444444] text-[10px] text-white">Space</kbd>
        </button>
        <p className="font-mono text-xs text-[#888888]">
          Read the sentence and recall the meaning of the highlighted word.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <div className="bg-[#F8F8F6] border-2 border-[#111111] p-5 shadow-[3px_3px_0px_#111111]">
        <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-[#111111]">{card.target_surface}</span>
            {card.target_pos && (
              <span className="font-mono text-xs px-1.5 py-0.5 bg-white border border-[#111111]">{card.target_pos}</span>
            )}
            <button type="button" onClick={handleSpeak} className="p-1 border border-[#111111] bg-white hover:bg-[#B8FF01] cursor-pointer">
              <Volume2 className="w-3.5 h-3.5 text-[#111111]" />
            </button>
          </div>
          <span className="font-mono text-xs font-bold text-[#2E7D32]">Meaning Revealed</span>
        </div>
        <div className="font-sans text-lg font-medium text-[#111111]">{card.english_definition}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onGrade(false)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#D32F2F] border-2 border-[#D32F2F] font-mono text-sm font-bold hover:bg-[#FFF5F5] cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
          <span>MISSED (1d)</span>
          <kbd className="px-1.5 py-0.5 bg-[#FFF0F0] border border-[#D32F2F] text-[10px]">1</kbd>
        </button>
        <button
          type="button"
          onClick={() => onGrade(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#111111] text-[#B8FF01] border-2 border-[#111111] font-mono text-sm font-bold hover:bg-[#222222] shadow-[3px_3px_0px_#111111] cursor-pointer transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>GOT IT! (Upgrade to Cloze)</span>
          <kbd className="px-1.5 py-0.5 bg-[#222222] border border-[#444444] text-[10px] text-white">2 or Space</kbd>
        </button>
      </div>
    </div>
  );
};
