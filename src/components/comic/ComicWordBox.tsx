import React from "react";
import type { ComicToken } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ComicWordBoxProps {
  token: ComicToken;
  zoom: number;
  status?: UserVocabStatus;
  isSelected?: boolean;
  showBoxes?: boolean;
  onSelect: (token: ComicToken) => void;
}

export const ComicWordBox: React.FC<ComicWordBoxProps> = ({
  token,
  zoom,
  status,
  isSelected,
  showBoxes,
  onSelect,
}) => {
  const [x0, y0, x1, y1] = token.box;
  const left = Math.round(x0 * zoom);
  const top = Math.round(y0 * zoom);
  const width = Math.max(2, Math.round((x1 - x0) * zoom));
  const height = Math.max(3, Math.round((y1 - y0) * zoom));

  const isIgnored = token.quarantine === "noise" || token.quarantine === "sfx";

  let highlightClass = "hover:bg-amber-300/30 hover:border-amber-400";
  if (isSelected) {
    highlightClass = "bg-amber-400/40 border-amber-600 ring-2 ring-amber-500 z-10";
  } else if (status === "known") {
    highlightClass = "border-transparent hover:border-emerald-400 hover:bg-emerald-200/20";
  } else if (status === "learning") {
    highlightClass = "border-transparent hover:border-sky-400 hover:bg-sky-200/20";
  }

  if (isIgnored) {
    return (
      <span
        style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
        className={`absolute pointer-events-none transition-colors ${
          showBoxes ? "border border-red-400/50 bg-red-400/15" : "border-transparent"
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
      style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
      className={`absolute cursor-pointer border rounded-xs transition-all ${highlightClass} ${
        showBoxes ? "border-emerald-400/60 bg-emerald-300/20" : "border-transparent"
      }`}
      title={`${token.surface} (${token.lemma || "?"})`}
    >
      <span className="sr-only">{token.surface}</span>
    </button>
  );
};
