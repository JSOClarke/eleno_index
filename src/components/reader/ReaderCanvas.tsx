import React, { useCallback } from "react";
import type {
  ElenoLexiconEntry,
  ElenoReaderBlock,
  ElenoToken,
  HighlightMode,
  RubyPosFilter,
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
  rubyPos: RubyPosFilter;
  showIPlusOne: boolean;
  highlightMode: HighlightMode;
  highlightUnknownOnly: boolean;
  onSelectToken: (surface: string, entry: ElenoLexiconEntry, bIdx: number, sIdx: number, morph?: string, tokenIndex?: number) => void;
  onToggleKnown?: (canonicalId: string, currentStatus: UserVocabStatus | undefined) => void;
}

const BLOCK_STYLES: Record<string, string> = {
  h1: "mt-8 mb-6 font-serif text-3xl font-bold text-[#111111]",
  h2: "mt-6 mb-4 font-serif text-2xl font-semibold text-[#111111]",
  h3: "mt-5 mb-3 font-serif text-xl font-semibold text-[#111111]",
  quote: "my-6 border-l-4 border-[#111111] pl-4 italic text-[#333333]",
  cue: "my-2 font-sans text-sm text-[#111111] bg-[#F8F8F6] p-2.5 border border-[#111111]",
};

function checkIPlusOne(sent: ElenoToken[], lexicon: ElenoLexiconEntry[], statusMap: Record<string, UserVocabStatus>): boolean {
  let unfamiliarCount = 0;
  for (const t of sent) {
    if (Array.isArray(t)) {
      const entry = lexicon[t[1]];
      if (entry?.id && statusMap[entry.id] !== "known") {
        unfamiliarCount++;
        if (unfamiliarCount > 1) return false;
      }
    }
  }
  return unfamiliarCount === 1;
}

export const ReaderCanvas: React.FC<ReaderCanvasProps> = React.memo(({
  blocks, lexicon, statusMap, fontSize, showRuby, rubyPos, showIPlusOne,
  highlightMode, highlightUnknownOnly, onSelectToken, onToggleKnown,
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-tok]");
    if (!target) return;
    e.stopPropagation();
    const b = Number(target.dataset.bidx);
    const s = Number(target.dataset.sidx);
    const t = Number(target.dataset.tok);
    if (Number.isNaN(b) || Number.isNaN(s) || Number.isNaN(t)) return;
    const tok = blocks[b]?.sentences[s]?.[t];
    if (!Array.isArray(tok)) return;
    const [surface, lexIdx, morph] = tok;
    const entry = lexicon[lexIdx];
    if (entry?.id) {
      document.querySelector(".token-selected")?.classList.remove("token-selected");
      target.classList.add("token-selected");
      onSelectToken(surface, entry, b, s, morph, t);
    }
  }, [blocks, lexicon, onSelectToken]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-tok]");
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    const b = Number(target.dataset.bidx);
    const s = Number(target.dataset.sidx);
    const t = Number(target.dataset.tok);
    if (Number.isNaN(b) || Number.isNaN(s) || Number.isNaN(t)) return;
    const tok = blocks[b]?.sentences[s]?.[t];
    if (!Array.isArray(tok)) return;
    const [, lexIdx] = tok;
    const entry = lexicon[lexIdx];
    if (entry?.id) onToggleKnown?.(entry.id, statusMap[entry.id]);
  }, [blocks, lexicon, onToggleKnown, statusMap]);

  return (
    <article
      id="reader-canvas-article"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className="mx-auto w-full max-w-[740px] select-text px-4 pb-28 pt-4 sm:px-6"
    >
      {blocks.map((block, bIdx) => {
        const isHeading = block.type === "h1" || block.type === "h2" || block.type === "h3";
        const wrapperClass = BLOCK_STYLES[block.type] || "mb-6 font-serif leading-[1.85] text-[#111111]";
        return (
          <div key={bIdx} data-block={bIdx} className={wrapperClass} style={{ fontSize: `${fontSize}px` }}>
            {block.sentences.map((sent, sIdx) => {
              const isIPlusOne = showIPlusOne && !isHeading && checkIPlusOne(sent, lexicon, statusMap);
              return (
                <span key={sIdx} className={isIPlusOne ? "inline bg-[#B8FF01]/15" : "inline"}>
                  {sent.map((tok, tIdx) => {
                    const entry = Array.isArray(tok) ? lexicon[tok[1]] : undefined;
                    return (
                      <ReaderTokenSpan
                        key={tIdx}
                        token={tok}
                        entry={entry}
                        status={entry?.id ? statusMap[entry.id] : undefined}
                        showRuby={showRuby}
                        rubyPos={rubyPos}
                        highlightMode={highlightMode}
                        highlightUnknownOnly={highlightUnknownOnly}
                        bIdx={bIdx}
                        sIdx={sIdx}
                        tIdx={tIdx}
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
});
ReaderCanvas.displayName = "ReaderCanvas";
