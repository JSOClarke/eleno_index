import React from "react";
import type { ElenoReaderChapterMeta } from "@/types/reader.types";

interface ReaderMobileBarProps {
  title: string;
  chapters: ElenoReaderChapterMeta[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onOpenSettings: () => void;
  onBack: () => void;
}

/** Compact reader chrome for phones: back, title, chapter switch, settings. */
export const ReaderMobileBar: React.FC<ReaderMobileBarProps> = ({
  title,
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onOpenSettings,
  onBack,
}) => (
  <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b-2 border-[#111111] bg-white px-3 md:hidden">
    <button
      type="button"
      onClick={onBack}
      aria-label="Back to book"
      className="shrink-0 px-1.5 py-2 font-mono text-lg leading-none text-[#111111] cursor-pointer"
    >
      ←
    </button>

    <div className="min-w-0 flex-1">
      <div className="truncate font-serif text-sm font-bold text-[#111111]">{title}</div>
    </div>

    <select
      value={currentChapterIndex}
      onChange={(event) => onSelectChapter(Number(event.target.value))}
      aria-label="Chapter"
      className="max-w-[104px] shrink-0 border border-[#111111] bg-white px-1.5 py-1 font-mono text-[11px] font-medium"
    >
      {chapters.map((chapter) => (
        <option key={chapter.index} value={chapter.index}>
          Ch. {chapter.index}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={onOpenSettings}
      aria-label="Reader settings"
      className="shrink-0 border border-[#111111] px-2 py-1.5 font-mono text-sm leading-none text-[#111111] cursor-pointer"
    >
      ⚙
    </button>
  </header>
);
