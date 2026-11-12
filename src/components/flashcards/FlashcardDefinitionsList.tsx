import React, { useState } from "react";

interface FlashcardDefinitionsListProps {
  definitions?: string[];
  fallback?: string;
  variant?: "full" | "cue";
  maxVisible?: number;
}

export const FlashcardDefinitionsList: React.FC<FlashcardDefinitionsListProps> = ({
  definitions,
  fallback,
  variant = "full",
  maxVisible = 3,
}) => {
  const [showAll, setShowAll] = useState(false);

  const list =
    Array.isArray(definitions) && definitions.length > 0
      ? definitions
      : fallback && fallback.trim().length > 0
      ? [fallback.trim()]
      : [];

  if (list.length === 0) {
    return <p className="text-sm italic text-[#888888]">No definition recorded.</p>;
  }

  if (variant === "cue") {
    const primary = list[0];
    const alternates = list.slice(1);
    return (
      <div className="space-y-1.5">
        <div className="font-sans text-xl sm:text-2xl font-bold text-[#111111]">
          {primary}
        </div>
        {alternates.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs text-[#555555]">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Also:
            </span>
            {alternates.slice(0, 3).map((def, idx) => (
              <span key={idx} className="inline-flex items-baseline gap-1">
                <span className="font-mono text-[10px] font-bold text-[#888888]">
                  {idx + 2}.
                </span>
                <span>{def}</span>
                {idx < Math.min(alternates.length, 3) - 1 && (
                  <span className="text-[#CCCCCC]">·</span>
                )}
              </span>
            ))}
            {alternates.length > 3 && (
              <span className="font-mono text-[10px] text-[#888888] italic">
                +{alternates.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (list.length === 1) {
    return (
      <div className="font-sans text-base sm:text-lg font-medium text-[#111111]">
        {list[0]}
      </div>
    );
  }

  const visibleList = showAll ? list : list.slice(0, maxVisible);
  const remainingCount = list.length - maxVisible;

  return (
    <div className="space-y-2 pt-1">
      <ol className="space-y-1.5 font-sans">
        {visibleList.map((def, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base leading-snug">
            <span className="font-mono text-[11px] font-bold text-[#666666] bg-[#EEEEEC] border border-[#D8D8D4] px-1.5 py-0.5 select-none shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span
              className={`text-[#111111] ${
                idx === 0 ? "font-semibold" : "font-normal text-[#333333]"
              }`}
            >
              {def}
            </span>
          </li>
        ))}
      </ol>
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="font-mono text-xs text-[#555555] hover:text-[#111111] underline underline-offset-4 decoration-[#888888] cursor-pointer pt-1"
        >
          {showAll ? "Show fewer senses" : `+ View ${remainingCount} more senses`}
        </button>
      )}
    </div>
  );
};
