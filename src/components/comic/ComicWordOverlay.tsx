import React from "react";
import type { ComicParagraph, ComicToken } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ComicWordBox } from "./ComicWordBox";

interface ComicWordOverlayProps {
  paragraphs: ComicParagraph[];
  zoom: number;
  statusMap: Record<string, UserVocabStatus>;
  selectedCanonicalId?: string | null;
  showBoxes?: boolean;
  onSelectToken: (token: ComicToken, paraIdx: number, tokenIdx: number) => void;
}

export const ComicWordOverlay: React.FC<ComicWordOverlayProps> = ({
  paragraphs,
  zoom,
  statusMap,
  selectedCanonicalId,
  showBoxes,
  onSelectToken,
}) => {
  return (
    <div className="absolute inset-0 h-full w-full pointer-events-auto select-none overflow-hidden">
      {paragraphs.map((para, paraIdx) => (
        <React.Fragment key={`para-${paraIdx}`}>
          {showBoxes && (
            <div
              style={{
                left: `${Math.round(para.box[0] * zoom)}px`,
                top: `${Math.round(para.box[1] * zoom)}px`,
                width: `${Math.round((para.box[2] - para.box[0]) * zoom)}px`,
                height: `${Math.round((para.box[3] - para.box[1]) * zoom)}px`,
              }}
              className="absolute pointer-events-none border border-dashed border-amber-400/60"
            />
          )}

          {para.tokens.map((token, tokIdx) => {
            // Never render interactive overlay boxes for standalone punctuation
            if (token.is_punct || !/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(token.surface)) {
              return null;
            }

            const status = token.canonical_id ? statusMap[token.canonical_id] : undefined;
            const isSelected = Boolean(
              selectedCanonicalId && token.canonical_id === selectedCanonicalId
            );

            return (
              <ComicWordBox
                key={`tok-${paraIdx}-${tokIdx}`}
                token={token}
                zoom={zoom}
                status={status}
                isSelected={isSelected}
                showBoxes={showBoxes}
                onSelect={(tok) => onSelectToken(tok, paraIdx, tokIdx)}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
