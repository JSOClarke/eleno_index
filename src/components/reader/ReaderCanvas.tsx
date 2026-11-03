import React from "react";
import type {
  ElenoLexiconEntry,
  ElenoReaderBlock,
  ElenoToken,
  HighlightMode,
} from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ReaderTokenSpan } from "./ReaderTokenSpan";

interface ReaderCanvasProps {
  blocks: ElenoReaderBlock[];
  lexicon: ElenoLexiconEntry[];
  statusMap: Record<string, UserVocabStatus>;
  chapterTitle?: string;
  chapterIndex?: number;
  creator?: string;
  fontSize: number;
  showRuby: boolean;
  showIPlusOne: boolean;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
  selectedTokenId: string | null;
  onSelectToken: (surface: string, entry: ElenoLexiconEntry, bIdx: number, sIdx: number, morph?: string) => void;
  onToggleKnown?: (canonicalId: string, currentStatus: UserVocabStatus | undefined) => void;
}

function checkIPlusOne(sent: ElenoToken[], lexicon: ElenoLexiconEntry[], statusMap: Record<string, UserVocabStatus>): boolean {
  let unfamiliarCount = 0;
  for (const t of sent) {
    if (Array.isArray(t)) {
      const entry = lexicon[t[1]];
      if (entry && statusMap[entry.id] !== "known") {
        unfamiliarCount++;
        if (unfamiliarCount > 1) return false;
      }
    }
  }
  return unfamiliarCount === 1;
}

export const ReaderCanvas: React.FC<ReaderCanvasProps> = ({
  blocks,
  lexicon,
  statusMap,
  fontSize,
  showRuby,
  showIPlusOne,
  highlightMode,
  highlightUnknownOnly,
  selectedTokenId,
  onSelectToken,
  onToggleKnown,
}) => {
  return (
    <article className="max-w-[740px] mx-auto select-text pt-4 pb-28">
      {blocks.map((block, bIdx) => {
        const isHeading = block.type === "h1" || block.type === "h2" || block.type === "h3";
        let wrapperClass = "mb-6 font-serif leading-[1.85] text-[#111111]";

        if (block.type === "h1") wrapperClass = "mt-8 mb-6 font-serif text-3xl font-bold text-[#111111]";
        else if (block.type === "h2") wrapperClass = "mt-6 mb-4 font-serif text-2xl font-semibold text-[#111111]";
        else if (block.type === "h3") wrapperClass = "mt-5 mb-3 font-serif text-xl font-semibold text-[#111111]";
        else if (block.type === "quote") wrapperClass = "my-6 border-l-4 border-[#111111] pl-4 italic text-[#333333]";
        else if (block.type === "cue") wrapperClass = "my-2 font-sans text-sm text-[#111111] bg-[#F8F8F6] p-2.5 border border-[#111111]";

        return (
          <div key={bIdx} data-block={bIdx} className={wrapperClass} style={{ fontSize: `${fontSize}px` }}>
            {block.sentences.map((sent, sIdx) => {
              const isIPlusOne = showIPlusOne && !isHeading && checkIPlusOne(sent, lexicon, statusMap);
              const sentClass = isIPlusOne
                ? "bg-[#B8FF01]/10 border-l-4 border-[#B8FF01] pl-2 py-0.5 inline"
                : "inline";

              return (
                <span key={sIdx} className={sentClass}>
                  {sent.map((tok, tIdx) => {
                    const isSelected = Array.isArray(tok) && lexicon[tok[1]]?.id === selectedTokenId;
                    return (
                      <ReaderTokenSpan
                        key={tIdx}
                        token={tok}
                        lexicon={lexicon}
                        statusMap={statusMap}
                        showRuby={showRuby}
                        highlightMode={highlightMode}
                        highlightUnknownOnly={highlightUnknownOnly}
                        isSelected={isSelected}
                        onSelect={(surf, entry, morph) => onSelectToken(surf, entry, bIdx, sIdx, morph)}
                        onToggleKnown={onToggleKnown}
                      />
                    );
                  })}
                </span>
              );
            })}
          </div>
        );
      })}
    </article>
  );
};
