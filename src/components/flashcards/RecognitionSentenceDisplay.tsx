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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#888888] font-bold">
            TARGET WORD:
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#111111]">
            {targetLemma || targetSurface}
          </span>
          {targetPos && (
            <span className="font-mono text-xs px-1.5 py-0.5 bg-[#F8F8F6] border border-[#E8E8E4] text-[#666666]">
              {targetPos}
            </span>
          )}
        </div>
      </div>

      <blockquote className="font-serif text-2xl sm:text-3xl leading-[1.6] text-[#111111] pl-4 border-l-2 border-[#111111]">
        <span>{prefix}</span>
        <mark className="bg-[#B8FF01] text-[#111111] px-1 py-0.5 font-semibold rounded-none">
          {match}
        </mark>
        <span>{suffix}</span>
      </blockquote>
    </div>
  );
};
