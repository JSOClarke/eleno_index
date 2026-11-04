import React from "react";
import { useReaderPosition } from "@/hooks/useReaderPosition";
import type { ElenoReaderChapter, ElenoReaderManifest } from "@/types/reader.types";
import { BookProgressRail } from "./BookProgressRail";
import { ChapterProgressRail } from "./ChapterProgressRail";

interface ReadingPositionRailProps {
  manifest: ElenoReaderManifest;
  chapterIndex: number;
  chapter: ElenoReaderChapter | null;
  savedPercentage: number;
  onSelectChapter: (index: number) => void;
}

/** Always-visible book position plus a magnified view of the current chapter. */
export const ReadingPositionRail: React.FC<ReadingPositionRailProps> = ({
  manifest,
  chapterIndex,
  chapter,
  savedPercentage,
  onSelectChapter,
}) => {
  const position = useReaderPosition(manifest, chapterIndex, chapter, Boolean(chapter));
  const bookPct = Math.round(position.bookFraction * 100);
  const chapterPct = Math.round(position.chapterFraction * 100);
  const blockCount = chapter?.blocks.length ?? 0;
  const blockLabel = blockCount > 0 ? `${Math.min(position.blockIndex + 1, blockCount)}/${blockCount}` : "—";

  return (
    <div
      title="Book position on top, current chapter below. Volt triangle = live position; black tick = last synced position."
      className="sticky top-14 z-20 border-b border-[#E2E2DF] bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-3 py-1.5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="w-[58px] shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
            BOOK {bookPct}%
          </span>
          <BookProgressRail
            manifest={manifest}
            chapterIndex={chapterIndex}
            chapterFraction={position.chapterFraction}
            bookFraction={position.bookFraction}
            savedPercentage={savedPercentage}
            onSelectChapter={onSelectChapter}
          />
          <span className="w-[44px] shrink-0 text-right font-mono text-[9px] tabular-nums text-[#666666]">
            {chapterIndex}/{manifest.total_chapters}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-[58px] shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-[#666666]">
            CH {chapterPct}%
          </span>
          <ChapterProgressRail chapter={chapter} chapterFraction={position.chapterFraction} />
          <span className="w-[44px] shrink-0 text-right font-mono text-[9px] tabular-nums text-[#666666]">
            {blockLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
