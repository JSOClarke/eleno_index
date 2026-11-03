import React from "react";
import { getTokenUnderlineClass } from "@/lib/readerHighlight";
import type { ElenoLexiconEntry, ElenoToken, HighlightMode } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReaderTokenSpanProps {
  token: ElenoToken;
  lexicon: ElenoLexiconEntry[];
  statusMap: Record<string, UserVocabStatus>;
  showRuby: boolean;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
  isSelected: boolean;
  onSelect: (surface: string, entry: ElenoLexiconEntry, morph?: string) => void;
}

export const ReaderTokenSpan: React.FC<ReaderTokenSpanProps> = React.memo(
  ({
    token,
    lexicon,
    statusMap,
    showRuby,
    highlightMode,
    highlightUnknownOnly,
    isSelected,
    onSelect,
  }) => {
    if (typeof token === "string") {
      return <span>{token}</span>;
    }

    const [surface, lexIdx, morph] = token;
    const entry = lexicon[lexIdx];
    if (!entry) return <span>{surface}</span>;

    const status = statusMap[entry.id];
    const isKnown = status === "known";
    const isLearning = status === "learning";
    const isUnknown = !status;

    const bandClass = getTokenUnderlineClass(entry, status, highlightMode, highlightUnknownOnly);

    let styleClass = "cursor-pointer transition-colors px-[1px] ";
    if (isSelected) {
      styleClass += "bg-[#111111] text-[#B8FF01] font-bold shadow-[2px_2px_0px_#B8FF01] ";
    } else if (bandClass) {
      if (isLearning) {
        styleClass += `bg-[#B8FF01] text-[#111111] font-semibold hover:bg-[#a6e600] ${bandClass}`;
      } else {
        styleClass += `text-[#111111] hover:bg-[#F4F4F2] ${bandClass}`;
      }
    } else if (isLearning) {
      styleClass += "bg-[#B8FF01] text-[#111111] font-semibold hover:bg-[#a6e600] ";
    } else if (isKnown) {
      styleClass += "text-[#111111] hover:bg-[#EAEAE6] ";
    } else {
      styleClass += "text-[#111111] border-b-2 border-dotted border-[#888888] hover:border-[#111111] hover:bg-[#F4F4F2] ";
    }

    const shouldShowRuby = showRuby && !!entry.hint && (isLearning || isUnknown);

    if (shouldShowRuby) {
      return (
        <span
          onClick={() => onSelect(surface, entry, morph)}
          className={styleClass}
        >
          <ruby className="[ruby-position:over]">
            {surface}
            <rt className="select-none font-mono text-[10px] font-bold text-[#111111] bg-[#B8FF01]/90 px-1 py-[1px] rounded-sm -translate-y-0.5">
              {entry.hint}
            </rt>
          </ruby>
        </span>
      );
    }

    return (
      <span
        onClick={() => onSelect(surface, entry, morph)}
        className={styleClass}
      >
        {surface}
      </span>
    );
  }
);
ReaderTokenSpan.displayName = "ReaderTokenSpan";
