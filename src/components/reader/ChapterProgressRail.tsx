import React from "react";
import type { ElenoReaderChapter } from "@/types/reader.types";

interface ChapterProgressRailProps {
  chapter: ElenoReaderChapter | null;
  chapterFraction: number;
}

export const ChapterProgressRail: React.FC<ChapterProgressRailProps> = ({
  chapter,
  chapterFraction,
}) => {
  const blockCount = chapter?.blocks.length ?? 0;
  const tickCount = Math.min(blockCount, 40);
  const liveLeft = Math.min(chapterFraction, 0.995) * 100;

  return (
    <div className="relative min-w-0 flex-1">
      <div className="relative h-2.5 w-full overflow-hidden border border-[#111111] bg-[#F8F8F6]">
        <div className="h-full bg-[#111111]" style={{ width: `${liveLeft}%` }} />
        {Array.from({ length: tickCount }).map((_, index) => (
          <span
            key={index}
            className="absolute top-0 h-full w-px bg-[#E2E2DF]"
            style={{ left: `${((index + 1) / tickCount) * 100}%` }}
          />
        ))}
      </div>

      <span
        className="pointer-events-none absolute top-0 h-2.5 w-[2px] -translate-x-1/2 bg-[#B8FF01]"
        style={{ left: `${liveLeft}%` }}
      />
    </div>
  );
};
