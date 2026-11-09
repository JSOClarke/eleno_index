import React from "react";

interface RecognitionSentenceDisplayProps {
  sentence: string;
  targetSurface: string;
  targetLemma?: string;
  targetPos?: string | null;
}

export const RecognitionSentenceDisplay: React.FC<RecognitionSentenceDisplayProps> = ({
  sentence,
  targetSurface,
  targetLemma,
  targetPos,
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

  return (
    <div className="space-y-4">
      {targetLemma && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F8F6] border border-[#111111]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#666666] tracking-wider">
            TARGET LEMMA
          </span>
          <span className="font-serif text-base font-bold text-[#111111]">
            {targetLemma}
          </span>
          {targetPos && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[#111111] text-[#111111]">
              {targetPos}
            </span>
          )}
        </div>
      )}
      <div className="font-serif text-xl sm:text-2xl leading-relaxed text-[#111111] selection:bg-[#B8FF01]">
        <span>{prefix}</span>
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 mx-1 border-2 border-[#111111] bg-[#B8FF01] font-mono text-base sm:text-lg font-bold text-[#111111] shadow-[2px_2px_0px_#111111]">
          {match}
        </span>
        <span>{suffix}</span>
      </div>
    </div>
  );
};
