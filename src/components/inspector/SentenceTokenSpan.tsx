import React from "react";
import type { SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface SentenceTokenSpanProps {
  token: SentenceToken;
  status?: UserVocabStatus;
  isTarget: boolean;
  onSelect?: (token: SentenceToken) => void;
}

export const SentenceTokenSpan: React.FC<SentenceTokenSpanProps> = ({
  token,
  status,
  isTarget,
  onSelect,
}) => {
  const clickable = Boolean(token.canonical_id && onSelect);
  let tone = "text-slate-700";

  if (isTarget) {
    tone = "rounded bg-indigo-50 text-indigo-700 font-semibold px-1 py-0.5 ring-1 ring-indigo-200/80";
  } else if (token.canonical_id && status === "learning") {
    tone = "text-slate-900 border-b-2 border-amber-400";
  } else if (token.canonical_id && (!status || status === "ignored")) {
    tone = "text-slate-700 border-b border-dotted border-slate-300";
  }

  const hoverTone = clickable
    ? isTarget
      ? "cursor-pointer hover:bg-indigo-100 transition-colors"
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
