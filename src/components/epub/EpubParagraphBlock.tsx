import React, { useMemo, useRef } from "react";
import { computeIPlusOneMap, getTokenHighlightClass } from "@/lib/epub/epubHighlightUtils";
import type { EpubHighlightMode, ParsedBlockResult, ParsedToken, SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubParagraphBlockProps {
  rawText: string;
  parsed?: ParsedBlockResult;
  statusMap: Record<string, UserVocabStatus>;
  highlightMode: EpubHighlightMode;
  selectedWordStart?: number | null;
  onSelectWord: (ctx: SelectedWordContext) => void;
  onOpenWheel?: (ctx: SelectedWordContext, point: { x: number; y: number }) => void;
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
  rawText, parsed, statusMap, highlightMode, selectedWordStart, onSelectWord, onOpenWheel,
}) => {
  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<{ x: number; y: number } | null>(null);
  const holdFiredRef = useRef(false);

  const i1Data = useMemo(
    () => (parsed ? computeIPlusOneMap(parsed, statusMap) : { tokenMap: new Map(), sentenceRanges: [] }),
    [parsed, statusMap]
  );

  if (!parsed || !parsed.tokens?.length) {
    return <p className="mb-4 leading-relaxed">{rawText}</p>;
  }

  const buildCtx = (el: HTMLElement, tok: ParsedToken, i1: { isTarget: boolean; targetSurface: string } | null): SelectedWordContext => {
    const r = el.getBoundingClientRect();
    const sentence = extractSentence(parsed.text, tok.start, tok.end);
    const phrases = (parsed.phrases || []).filter((p) => p.char_start <= tok.start && tok.end <= p.char_end);
    return { token: tok, sentence, phrases, iPlusOne: i1, anchorRect: { top: r.top, left: r.left, bottom: r.bottom, width: r.width } };
  };

  const clearHold = () => {
    if (holdTimerRef.current !== null) { window.clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
  };

  const inI1Range = (s: number, e: number) => highlightMode !== "off" && i1Data.sentenceRanges.some((r) => s >= r.start && e <= r.end);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  parsed.tokens.forEach((tok, idx) => {
    if (tok.start > cursor) {
      parts.push(<span key={`g-${idx}`} className={inI1Range(cursor, tok.start) ? "bg-[rgba(14,116,144,0.075)]" : undefined}>{parsed.text.slice(cursor, tok.start)}</span>);
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
      const cls = getTokenHighlightClass(tok, status, highlightMode, selectedWordStart === tok.start, inPhrase, i1);
      parts.push(
        <span
          key={`t-${idx}`} role="button" tabIndex={0}
          style={{ WebkitTouchCallout: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            if (holdFiredRef.current) { holdFiredRef.current = false; return; }
            onSelectWord(buildCtx(e.currentTarget, tok, i1));
          }}
          onContextMenu={(e) => {
            if (!onOpenWheel) return;
            e.preventDefault(); e.stopPropagation();
            onOpenWheel(buildCtx(e.currentTarget, tok, i1), { x: e.clientX, y: e.clientY });
          }}
          onTouchStart={(e) => {
            if (!onOpenWheel || e.touches.length !== 1) return;
            const t = e.touches[0];
            const el = e.currentTarget;
            holdFiredRef.current = false;
            holdStartRef.current = { x: t.clientX, y: t.clientY };
            clearHold();
            holdTimerRef.current = window.setTimeout(() => {
              holdFiredRef.current = true;
              navigator.vibrate?.(12);
              onOpenWheel(buildCtx(el, tok, i1), { x: t.clientX, y: t.clientY });
            }, 380);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            const s = holdStartRef.current;
            if (t && s && (Math.abs(t.clientX - s.x) > 10 || Math.abs(t.clientY - s.y) > 10)) clearHold();
          }}
          onTouchEnd={clearHold}
          onTouchCancel={clearHold}
          className={`cursor-pointer select-none transition-colors ${cls}`}
        >{surface}</span>
      );
    }
    cursor = tok.end;
  });

  if (cursor < parsed.text.length) parts.push(<span key="tail">{parsed.text.slice(cursor)}</span>);
  return <p className="mb-4 leading-relaxed">{parts}</p>;
};
