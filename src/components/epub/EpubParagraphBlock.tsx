import React from "react";
import type { ParsedBlockResult, ParsedToken, SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubParagraphBlockProps {
  rawText: string;
  parsed?: ParsedBlockResult;
  statusMap: Record<string, UserVocabStatus>;
  highlightUnknown: boolean;
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
  rawText,
  parsed,
  statusMap,
  highlightUnknown,
  selectedWordStart,
  onSelectWord,
}) => {
  if (!parsed || !parsed.tokens?.length) {
    return <p className="mb-4 leading-relaxed">{rawText}</p>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  parsed.tokens.forEach((tok, idx) => {
    if (tok.start > cursor) {
      parts.push(<span key={`g-${idx}`}>{parsed.text.slice(cursor, tok.start)}</span>);
    }
    const surface = parsed.text.slice(tok.start, tok.end) || tok.surface;
    const cid = tok.canonical?.canonical_id || tok.canonical?.id;
    const status = (cid ? statusMap[cid] : undefined) || tok.user_status || null;
    const isInteractive = Boolean(tok.is_word !== false && (tok.canonical || /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(surface)));

    if (!isInteractive) {
      parts.push(<span key={`t-${idx}`}>{surface}</span>);
    } else {
      const isSelected = selectedWordStart === tok.start;
      const showUnderline = highlightUnknown && status !== "known" && !tok.is_stop;
      const cls = isSelected
        ? "rounded bg-slate-900 px-0.5 text-white"
        : status === "learning"
          ? "border-b-2 border-amber-400/90 hover:bg-amber-400/15"
          : showUnderline
            ? "border-b border-dotted border-slate-400/70 hover:bg-slate-400/15"
            : "hover:bg-slate-400/15 rounded";

      parts.push(
        <span
          key={`t-${idx}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const sentence = extractSentence(parsed.text, tok.start, tok.end);
            const phrases = (parsed.phrases || []).filter(
              (p) => tok.start >= p.start - 2 && tok.end <= p.end + 2
            );
            onSelectWord({
              token: tok,
              sentence,
              phrases,
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
