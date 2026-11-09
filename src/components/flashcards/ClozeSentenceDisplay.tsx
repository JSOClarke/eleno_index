import React from "react";

interface ClozeSentenceDisplayProps {
  sentence: string;
  targetSurface: string;
  isRevealed: boolean;
  revealedText?: string;
  feedbackStatus?: "correct" | "incorrect" | null;
}

export const ClozeSentenceDisplay: React.FC<ClozeSentenceDisplayProps> = ({
  sentence,
  targetSurface,
  isRevealed,
  revealedText,
  feedbackStatus,
}) => {
  const lowerSentence = sentence.toLowerCase();
  const lowerTarget = targetSurface.toLowerCase();
  const matchIndex = lowerSentence.indexOf(lowerTarget);

  let prefix = sentence;
  let match = targetSurface;
  let suffix = "";

  if (matchIndex !== -1) {
    prefix = sentence.slice(0, matchIndex);
    match = sentence.slice(matchIndex, matchIndex + targetSurface.length);
    suffix = sentence.slice(matchIndex + targetSurface.length);
  }

  const slotBg =
    feedbackStatus === "correct"
      ? "bg-[#B8FF01] text-[#111111] border-[#111111]"
      : feedbackStatus === "incorrect"
      ? "bg-[#FF3333] text-white border-[#FF3333]"
      : isRevealed
      ? "bg-[#111111] text-[#B8FF01] border-[#111111]"
      : "bg-[#FAFAF8] text-[#888888] border-[#CCCCCC] border-dashed";

  return (
    <div className="font-serif text-xl sm:text-2xl leading-relaxed text-[#111111] selection:bg-[#B8FF01]">
      <span>{prefix}</span>
      <span
        className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-0.5 mx-1 border font-mono text-base sm:text-lg font-bold transition-all ${slotBg}`}
      >
        {isRevealed ? revealedText || match : "[ · · · ]"}
      </span>
      <span>{suffix}</span>
    </div>
  );
};
