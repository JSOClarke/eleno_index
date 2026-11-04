import React, { useState } from "react";
import type { ElenoReaderChapterMeta, HighlightMode, ProgressSyncState } from "@/types/reader.types";
import { ReaderMobileBar } from "./ReaderMobileBar";
import { ReaderSettingsSheet } from "./ReaderSettingsSheet";

interface ReaderMobileControlsProps {
  title: string;
  chapters: ElenoReaderChapterMeta[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onBack: () => void;
  fontSize: number;
  onAdjustFontSize: (delta: number) => void;
  showIPlusOne: boolean;
  onToggleIPlusOne: () => void;
  highlightMode: HighlightMode;
  onChangeHighlightMode: (mode: HighlightMode) => void;
  highlightUnknownOnly: boolean;
  onToggleHighlightUnknownOnly: () => void;
  progressSync: ProgressSyncState;
}

/** Phone reader chrome: compact bar plus the settings sheet it opens. */
export const ReaderMobileControls: React.FC<ReaderMobileControlsProps> = ({
  title,
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onBack,
  fontSize,
  onAdjustFontSize,
  showIPlusOne,
  onToggleIPlusOne,
  highlightMode,
  onChangeHighlightMode,
  highlightUnknownOnly,
  onToggleHighlightUnknownOnly,
  progressSync,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <ReaderMobileBar
        title={title}
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={onSelectChapter}
        onOpenSettings={() => setSettingsOpen(true)}
        onBack={onBack}
        progressSync={progressSync}
      />
      <ReaderSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        onAdjustFontSize={onAdjustFontSize}
        showIPlusOne={showIPlusOne}
        onToggleIPlusOne={onToggleIPlusOne}
        highlightMode={highlightMode}
        onChangeHighlightMode={onChangeHighlightMode}
        highlightUnknownOnly={highlightUnknownOnly}
        onToggleHighlightUnknownOnly={onToggleHighlightUnknownOnly}
      />
    </>
  );
};
