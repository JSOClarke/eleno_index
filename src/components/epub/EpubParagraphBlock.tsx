import React, { useMemo } from "react";
import { computeIPlusOneMap, getTokenHighlightClass } from "@/lib/epub/epubHighlightUtils";
import type { EpubHighlightMode, ParsedBlockResult, SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubParagraphBlockProps {
  rawText: string;
  parsed?: ParsedBlockResult;
  statusMap: Record<string, UserVocabStatus>;
  highlightMode: EpubHighlightMode;
  selectedWordStart?: number | null;
  onSelectWord: (ctx: SelectedWordContext) => void;
}

function extractSentence(text: string, start: number, end: number): string {
  const before = text.slice(0, start);
  const after = text.slice(end);
  const leftIdx = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?"), before.lastIndexOf("¿"), before.lastIndexOf("¡"));
  const rightMatch = after.search(/[.!?]/);
  const sStart = leftIdx >= 0 ? (/[¿¡]/.test(before[leftIdx]) ? leftIdx : leftIdx + 1) : 0;
  const sEnd = rightMatch >= 0 ? end + rightMatch + 1 : text.length;
  return text.slice(sStart, sEnd).trim() || text;
}

export const EpubParagraphBlock: React.FC<EpubParagraphBlockProps> = ({
  rawText, parsed, statusMap, highlightMode, selectedWordStart, onSelectWord,
}) => {
  const i1Data = useMemo(
    () => (parsed ? computeIPlusOneMap(parsed, statusMap) : { tokenMap: new Map(), sentenceRanges: [] }),
    [parsed, statusMap]
  );

  if (!parsed || !parsed.tokens?.length) {
    return <p className="mb-4 leading-relaxed">{rawText}</p>;
  }

  const inI1Range = (s: number, e: number) =>
    highlightMode !== "off" && i1Data.sentenceRanges.some((r) => s >= r.start && e <= r.end);

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  parsed.tokens.forEach((tok, idx) => {
    if (tok.start > cursor) {
      const gapInI1 = inI1Range(cursor, tok.start);
      parts.push(
        <span key={`g-${idx}`} className={gapInI1 ? "bg-[rgba(14,116,144,0.075)]" : undefined}>
          {parsed.text.slice(cursor, tok.start)}
        </span>
      );
    }
    const surface = parsed.text.slice(tok.start, tok.end) || tok.surface;
    const cid = tok.canonical?.canonical_id || tok.canonical?.id;
    const status = (cid ? statusMap[cid] : undefined) || tok.user_status || null;
    const isInteractive = Boolean(tok.is_word !== false && (tok.canonical || /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(surface)));
    const inPhrase = (parsed.phrases || []).some((p) => p.char_start <= tok.start && tok.end <= p.char_end);
    const i1 = i1Data.tokenMap.get(idx) || null;

    if (!isInteractive) {
      parts.push(<span key={`t-${idx}`} className={i1 && highlightMode !== "off" ? "bg-[rgba(14,116,144,0.075)]" : undefined}>{surface}</span>);
    } else {
      const isSelected = selectedWordStart === tok.start;
      const cls = getTokenHighlightClass(tok, status, highlightMode, isSelected, inPhrase, i1);
      parts.push(
        <span
          key={`t-${idx}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const sentence = extractSentence(parsed.text, tok.start, tok.end);
            const phrases = (parsed.phrases || []).filter((p) => p.char_start <= tok.start && tok.end <= p.char_end);
            onSelectWord({
              token: tok, sentence, phrases, iPlusOne: i1,
              anchorRect: { top: r.top, left: r.left, bottom: r.bottom, width: r.width },
            });
          }}
          className={`cursor-pointer transition-colors ${cls}`}
        >
          {surface}
        </span>
      );
    }
    cursor = tok.end;
  });

  if (cursor < parsed.text.length) {
    parts.push(<span key="tail">{parsed.text.slice(cursor)}</span>);
  }

  return <p className="mb-4 leading-relaxed">{parts}</p>;
};
