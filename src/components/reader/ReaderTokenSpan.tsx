import React from "react";
import { getTokenUnderlineClass } from "@/lib/readerHighlight";
import type { ElenoLexiconEntry, ElenoToken, HighlightMode, RubyPosFilter } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReaderTokenSpanProps {
  token: ElenoToken;
  entry?: ElenoLexiconEntry;
  status?: UserVocabStatus;
  showRuby: boolean;
  rubyPos: RubyPosFilter;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
  bIdx: number;
  sIdx: number;
  tIdx: number;
}

export const ReaderTokenSpan: React.FC<ReaderTokenSpanProps> = React.memo(
  ({
    token,
    entry,
    status,
    showRuby,
    rubyPos,
    highlightMode,
    highlightUnknownOnly,
    bIdx,
    sIdx,
    tIdx,
  }) => {
    if (typeof token === "string") {
      return <span>{token}</span>;
    }

    const [surface, lexIdx] = token;
    if (!entry) return <span>{surface}</span>;

    // Untracked wordform (proper noun, typo, unindexed): plain text, no actions.
    if (!entry.id) return <span>{surface}</span>;

    const isKnown = status === "known";
    const isLearning = status === "learning";
    const isUnknown = !status;

    const bandClass = getTokenUnderlineClass(entry, status, highlightMode, highlightUnknownOnly);

    let styleClass = "relative inline cursor-pointer px-[1px] border-b-[2.5px] ";
    if (bandClass) {
      if (isLearning) {
        styleClass += `bg-[#B8FF01] text-[#111111] hover:bg-[#a6e600] ${bandClass}`;
      } else {
        styleClass += `text-[#111111] hover:bg-[#F4F4F2] ${bandClass}`;
      }
    } else if (isLearning) {
      styleClass += "bg-[#B8FF01] text-[#111111] hover:bg-[#a6e600] border-transparent ";
    } else if (isKnown) {
      styleClass += "text-[#111111] hover:bg-[#EAEAE6] border-transparent ";
    } else {
      styleClass += "text-[#111111] border-dotted !border-[#888888] hover:!border-[#111111] hover:bg-[#F4F4F2] ";
    }

    const shouldShowRuby =
      showRuby &&
      !!entry.hint &&
      (isLearning || isUnknown) &&
      (rubyPos === "ALL" || entry.pos === rubyPos);

    return (
      <span
        data-tok={tIdx}
        data-bidx={bIdx}
        data-sidx={sIdx}
        data-lex={lexIdx}
        className={styleClass}
      >
        {shouldShowRuby && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-0.5 pointer-events-none select-none z-10 whitespace-nowrap font-mono text-[10px] font-bold text-[#111111] bg-[#B8FF01]/90 px-1 py-[1px] rounded-sm max-w-[120px] truncate leading-none hidden xl:block">
            {entry.hint}
          </span>
        )}
        {surface}
      </span>
    );
  }
);
ReaderTokenSpan.displayName = "ReaderTokenSpan";
