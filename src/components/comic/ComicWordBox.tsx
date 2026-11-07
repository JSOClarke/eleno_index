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
  if (token.is_punct || !/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(token.surface)) {
    return null;
  }

  const isIgnored = token.quarantine === "noise" || token.quarantine === "sfx";

  let highlightClass = "";
  if (isSelected) {
    highlightClass = "border-2 border-[#111111] bg-[#B8FF01]/55 shadow-[2px_2px_0px_#111111] z-20";
  } else if (showBoxes) {
    if (status === "learning") {
      highlightClass = "border border-[#111111] bg-[#B8FF01]/35 hover:bg-[#B8FF01]/50";
    } else if (status === "known") {
      highlightClass = "border border-dotted border-[#111111]/30 bg-transparent hover:border-[#111111] hover:bg-[#111111]/10";
    } else {
      highlightClass = "border border-[#111111]/40 bg-black/[0.04] hover:border-[#111111] hover:bg-[#B8FF01]/30";
    }
  } else {
    if (status === "learning") {
      highlightClass = "border-b-2 border-[#B8FF01] bg-[#B8FF01]/20 hover:border-[#111111] hover:bg-[#B8FF01]/40";
    } else if (status === "known") {
      highlightClass = "border-transparent hover:border-[#111111]/50 hover:bg-[#111111]/10";
    } else {
      highlightClass = "border-transparent hover:border-[#111111] hover:bg-[#B8FF01]/30";
    }
  }

  const rawBoxes = token.boxes && token.boxes.length > 0 ? token.boxes : [token.box];

  return (
    <>
      {rawBoxes.map((b, bIdx) => {
        const [x0, y0, x1, y1] = b;
        const left = Math.round(x0 * zoom);
        const top = Math.round(y0 * zoom);
        const width = Math.max(2, Math.round((x1 - x0) * zoom));
        const height = Math.max(3, Math.round((y1 - y0) * zoom));

        if (isIgnored) {
          return (
            <span
              key={`box-${bIdx}`}
              style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
              className={`absolute pointer-events-none transition-colors ${
                showBoxes ? "border border-dashed border-red-500/50 bg-red-500/10" : "border-transparent"
              }`}
              title={`[Quarantine: ${token.quarantine}] ${token.surface}`}
            />
          );
        }

        return (
          <button
            key={`btn-${bIdx}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(token);
            }}
            style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
            className={`absolute cursor-pointer rounded-xs transition-all ${highlightClass}`}
            title={`${token.surface} (${token.lemma || "?"})`}
          >
            <span className="sr-only">{token.surface}</span>
          </button>
        );
      })}
    </>
  );
};
