import React, { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
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
    const u = new SpeechSynthesisUtterance(card.target_lemma || card.target_surface);
    u.lang = "es-ES";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  if (!revealed) {
    return (
      <div className="pt-6 border-t border-[#E8E8E4] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-[#777777]">
          Recall the meaning of <span className="text-[#111111] font-bold">{card.target_lemma || card.target_surface}</span> in this context.
        </p>
        <button
          type="button"
          onClick={handleReveal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#111111] text-white font-mono text-xs font-bold hover:bg-[#B8FF01] hover:text-[#111111] transition-colors cursor-pointer border border-[#111111]"
        >
          <span>SHOW DEFINITION</span>
          <kbd className="bg-[#222222] text-[#B8FF01] border-[#444444] px-1.5 py-0.5 text-[10px] font-mono">SPACE</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="bg-[#FBFBFA] border border-[#111111] p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8E8E4] pb-2">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-2xl font-bold text-[#111111]">{card.target_lemma}</span>
            {card.target_pos && (
              <span className="font-mono text-xs px-1.5 py-0.5 bg-white border border-[#E8E8E4] text-[#666666]">{card.target_pos}</span>
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
          <span className="font-mono text-[11px] font-semibold text-[#2E7D32] tracking-wider uppercase">
            Meaning Revealed
          </span>
        </div>
        <div className="font-sans text-lg font-medium text-[#111111]">{card.english_definition}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onGrade(false)}
          className="flex items-center justify-between px-5 py-3.5 bg-white border border-[#111111] text-[#111111] font-mono text-xs font-bold hover:bg-[#FFF5F5] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="text-[#D32F2F]">✕</span>
            <span>MISSED (RESET TO LVL 1)</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-[#F4F4F2] border border-[#D4D4D0]">1</kbd>
        </button>

        <button
          type="button"
          onClick={() => onGrade(true)}
          className="flex items-center justify-between px-5 py-3.5 bg-[#111111] border border-[#111111] text-white font-mono text-xs font-bold hover:bg-[#B8FF01] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="text-[#B8FF01]">✓</span>
            <span>GOT IT! (PROMOTE TO LVL 2)</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-[#222222] text-white border-[#444444]">SPACE / 2</kbd>
        </button>
      </div>
    </div>
  );
};
