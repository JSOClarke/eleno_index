import React, { useRef } from "react";
import type { ComicPageData, ComicToken } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ComicWordOverlay } from "./ComicWordOverlay";

interface ComicPageCanvasProps {
  pageData: ComicPageData;
  zoom: number;
  statusMap: Record<string, UserVocabStatus>;
  selectedCanonicalId?: string | null;
  showBoxes?: boolean;
  onSelectToken: (token: ComicToken, paraIdx: number, tokenIdx: number) => void;
  onBackgroundClick?: () => void;
}

export const ComicPageCanvas: React.FC<ComicPageCanvasProps> = ({
  pageData,
  zoom,
  statusMap,
  selectedCanonicalId,
  showBoxes,
  onSelectToken,
  onBackgroundClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const displayWidth = Math.round(pageData.width * zoom);
  const displayHeight = Math.round(pageData.height * zoom);

  return (
    <div
      onClick={onBackgroundClick}
      className="relative flex min-h-full w-full items-start justify-center overflow-auto p-4 select-none"
    >
      <div
        ref={containerRef}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          position: "relative",
          flex: "none",
          lineHeight: 0,
        }}
        className="shadow-2xl bg-neutral-900 border border-neutral-800 transition-all duration-75"
      >
        <img
          src={pageData.image_url}
          alt={`Comic page ${pageData.page_index}`}
          style={{ width: "100%", height: "100%", display: "block" }}
          className="select-none pointer-events-none"
          draggable={false}
        />

        <ComicWordOverlay
          paragraphs={pageData.paragraphs}
          zoom={zoom}
          statusMap={statusMap}
          selectedCanonicalId={selectedCanonicalId}
          showBoxes={showBoxes}
          onSelectToken={onSelectToken}
        />
      </div>
    </div>
  );
};
