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

  const borderColor =
    feedbackStatus === "correct"
      ? "border-[#2E7D32]"
      : feedbackStatus === "incorrect"
      ? "border-[#D32F2F]"
      : "border-[#E8E8E4]";

  return (
    <blockquote className={`font-serif text-2xl sm:text-3xl leading-[1.6] text-[#111111] pl-4 border-l-2 ${borderColor}`}>
      <span>{prefix}</span>
      {isRevealed ? (
        <mark
          className={`px-1.5 py-0.5 font-bold rounded-none ${
            feedbackStatus === "correct"
              ? "bg-[#B8FF01] text-[#111111]"
              : feedbackStatus === "incorrect"
              ? "bg-[#FFF0F0] text-[#D32F2F] border-b-2 border-[#D32F2F]"
              : "bg-[#111111] text-[#B8FF01]"
          }`}
        >
          {revealedText || match}
        </mark>
      ) : (
        <span className="inline-block min-w-[80px] border-b-2 border-[#111111] px-2 text-center font-mono font-semibold text-[#888888]">
          [ · · · ]
        </span>
      )}
      <span>{suffix}</span>
    </blockquote>
  );
};
