import React from "react";
import type { ComicParagraph, ComicToken } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ComicWordBox } from "./ComicWordBox";

interface ComicWordOverlayProps {
  paragraphs: ComicParagraph[];
  pageWidth: number;
  pageHeight: number;
  statusMap: Record<string, UserVocabStatus>;
  selectedCanonicalId?: string | null;
  showBoxes?: boolean;
  onSelectToken: (token: ComicToken, paraIdx: number, tokenIdx: number) => void;
}

export const ComicWordOverlay: React.FC<ComicWordOverlayProps> = ({
  paragraphs,
  pageWidth,
  pageHeight,
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
                left: `${(para.box[0] / pageWidth) * 100}%`,
                top: `${(para.box[1] / pageHeight) * 100}%`,
                width: `${((para.box[2] - para.box[0]) / pageWidth) * 100}%`,
                height: `${((para.box[3] - para.box[1]) / pageHeight) * 100}%`,
              }}
              className="absolute pointer-events-none border border-dashed border-amber-400/50"
            />
          )}

          {para.tokens.map((token, tokIdx) => {
            const status = token.canonical_id ? statusMap[token.canonical_id] : undefined;
            const isSelected = Boolean(
              selectedCanonicalId && token.canonical_id === selectedCanonicalId
            );

            return (
              <ComicWordBox
                key={`tok-${paraIdx}-${tokIdx}`}
                token={token}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
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
