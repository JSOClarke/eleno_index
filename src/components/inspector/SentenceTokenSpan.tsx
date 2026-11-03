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
  let tone = "text-[#111111]";

  if (isTarget) {
    tone = "bg-[#B8FF01] text-[#111111] font-bold px-0.5";
  } else if (token.canonical_id && status === "learning") {
    tone = "text-[#111111] border-b-2 border-[#B8FF01]";
  } else if (token.canonical_id && (!status || status === "ignored")) {
    tone = "border-b border-dotted border-[#888888]";
  }

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
      className={`${tone} ${clickable ? "cursor-pointer hover:bg-[#F4F4F2]" : ""}`}
    >
      {token.surface}
    </span>
  );
};
