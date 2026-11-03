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
  onToggleKnown?: (canonicalId: string, currentStatus: UserVocabStatus | undefined) => void;
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
    onToggleKnown,
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

    let styleClass = "relative inline cursor-pointer transition-colors px-[1px] border-b-[2.5px] ";
    if (isSelected) {
      styleClass += "bg-[#111111] text-[#B8FF01] border-[#B8FF01] shadow-[2px_2px_0px_#B8FF01] ";
    } else if (bandClass) {
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

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(surface, entry, morph);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleKnown?.(entry.id, status);
    };

    const shouldShowRuby = showRuby && !!entry.hint && (isLearning || isUnknown);

    return (
      <span
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={styleClass}
      >
        {shouldShowRuby && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-0.5 pointer-events-none select-none z-10 whitespace-nowrap font-mono text-[10px] font-bold text-[#111111] bg-[#B8FF01]/90 px-1 py-[1px] rounded-sm max-w-[120px] truncate leading-none">
            {entry.hint}
          </span>
        )}
        <span>{surface}</span>
      </span>
    );
  }
);
ReaderTokenSpan.displayName = "ReaderTokenSpan";
