import React from "react";
import type { ComicToken } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ComicWordBoxProps {
  token: ComicToken;
  pageWidth: number;
  pageHeight: number;
  status?: UserVocabStatus;
  isSelected?: boolean;
  showBoxes?: boolean;
  onSelect: (token: ComicToken) => void;
}

export const ComicWordBox: React.FC<ComicWordBoxProps> = ({
  token,
  pageWidth,
  pageHeight,
  status,
  isSelected,
  showBoxes,
  onSelect,
}) => {
  const [x0, y0, x1, y1] = token.box;
  const leftPct = (x0 / pageWidth) * 100;
  const topPct = (y0 / pageHeight) * 100;
  const widthPct = ((x1 - x0) / pageWidth) * 100;
  const heightPct = ((y1 - y0) / pageHeight) * 100;

  const isQuarantined = Boolean(token.quarantine);
  const isIgnored = token.quarantine === "noise" || token.quarantine === "sfx";

  let highlightClass = "hover:bg-amber-300/30 hover:border-amber-400";
  if (isSelected) {
    highlightClass = "bg-amber-400/40 border-amber-600 ring-2 ring-amber-500";
  } else if (status === "known") {
    highlightClass = "border-transparent hover:border-emerald-400 hover:bg-emerald-200/20";
  } else if (status === "learning") {
    highlightClass = "border-transparent hover:border-sky-400 hover:bg-sky-200/20";
  }

  if (isIgnored) {
    return (
      <span
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
        className={`absolute pointer-events-none transition-colors ${
          showBoxes ? "border border-red-400/40 bg-red-400/10" : "border-transparent"
        }`}
        title={`[Quarantine: ${token.quarantine}] ${token.surface}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(token);
      }}
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
      className={`absolute cursor-pointer border rounded-xs transition-all ${highlightClass} ${
        showBoxes ? "border-emerald-400/50 bg-emerald-300/10" : "border-transparent"
      }`}
      title={`${token.surface} (${token.lemma || "?"})`}
    >
      <span className="sr-only">{token.surface}</span>
    </button>
  );
};
