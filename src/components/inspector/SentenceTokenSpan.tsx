import React from "react";
import type { SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface SentenceTokenSpanProps {
  token: SentenceToken;
  status?: UserVocabStatus;
  isTarget: boolean;
  isSelected?: boolean;
  onSelect?: (token: SentenceToken) => void;
}

export const SentenceTokenSpan: React.FC<SentenceTokenSpanProps> = ({
  token,
  status,
  isTarget,
  isSelected = false,
  onSelect,
}) => {
  const clickable = Boolean(token.canonical_id && onSelect);
  let tone = "text-slate-600";

  if (isSelected) {
    tone = "rounded bg-slate-900 text-white font-semibold px-1 py-0.5 shadow-xs";
  } else if (isTarget) {
    tone = "rounded bg-slate-900/8 text-slate-950 font-semibold px-1 py-0.5 ring-1 ring-slate-300";
  } else if (token.canonical_id && status === "learning") {
    tone = "text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-4";
  } else if (token.canonical_id && (!status || status === "ignored")) {
    tone = "text-slate-800 underline decoration-dotted decoration-slate-300 underline-offset-4";
  }

  const hoverTone = clickable
    ? isSelected
      ? "cursor-pointer"
      : isTarget
        ? "cursor-pointer hover:bg-slate-900/12 transition-colors"
        : "cursor-pointer hover:bg-slate-100 rounded-sm transition-colors"
    : "";

  return (
    <span
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={token.lemma ? `${token.lemma} · ${token.pos || ""}` : undefined}
      onClick={clickable ? () => onSelect?.(token) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onSelect?.(token);
            }
          : undefined
      }
      className={`${tone} ${hoverTone}`}
    >
      {token.surface}
    </span>
  );
};
