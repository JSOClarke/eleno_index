import React from "react";
import type { ElenoReaderManifest } from "@/types/reader.types";

interface BookProgressRailProps {
  manifest: ElenoReaderManifest;
  chapterIndex: number;
  chapterFraction: number;
  bookFraction: number;
  savedPercentage: number;
  onSelectChapter: (index: number) => void;
}

export const BookProgressRail: React.FC<BookProgressRailProps> = ({
  manifest,
  chapterIndex,
  chapterFraction,
  bookFraction,
  savedPercentage,
  onSelectChapter,
}) => {
  const liveLeft = Math.min(bookFraction, 0.995) * 100;
  const savedLeft = Math.min(savedPercentage, 99.5);

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex h-2.5 w-full overflow-hidden border border-[#111111] bg-[#F8F8F6]">
        {manifest.chapters.map((chapter) => {
          const width = Math.max(chapter.token_count, 0);
          const read =
            chapter.index < chapterIndex
              ? 1
              : chapter.index === chapterIndex
                ? chapterFraction
                : 0;
          const active = chapter.index === chapterIndex;

          return (
            <button
              key={chapter.index}
              type="button"
              onClick={() => onSelectChapter(chapter.index)}
              aria-label={`Chapter ${chapter.index}: ${chapter.title}`}
              title={`${chapter.title} · ${chapter.token_count.toLocaleString()} words`}
              style={{ flexGrow: width, flexBasis: 0, minWidth: 2 }}
              className={`relative h-full shrink border-r border-[#E2E2DF] last:border-r-0 cursor-pointer ${
                active ? "bg-[#F4F4F2]" : "bg-white hover:bg-[#F8F8F6]"
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-[#111111]"
                style={{ width: `${read * 100}%` }}
              />
            </button>
          );
        })}
      </div>

      <span
        className="pointer-events-none absolute top-0 h-2.5 w-[2px] -translate-x-1/2 bg-[#B8FF01]"
        style={{ left: `${liveLeft}%` }}
      />
      <span
        className="pointer-events-none absolute -top-1.5 border-x-[3px] border-t-[5px] border-x-transparent border-t-[#B8FF01]"
        style={{ left: `calc(${liveLeft}% - 3px)` }}
      />
      {savedPercentage > 0 && (
        <span
          className="pointer-events-none absolute -bottom-1.5 h-2 w-[3px] -translate-x-1/2 bg-[#111111]"
          style={{ left: `${savedLeft}%` }}
          title="Last synced position"
        />
      )}
    </div>
  );
};
