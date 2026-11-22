import React, { useState } from "react";
import { EpubBookshelf } from "@/components/epub/EpubBookshelf";
import { EpubReaderHeader } from "@/components/epub/EpubReaderHeader";
import { EpubReaderViewport } from "@/components/epub/EpubReaderViewport";
import { EpubSettingsDrawer } from "@/components/epub/EpubSettingsDrawer";
import { EpubTocDrawer } from "@/components/epub/EpubTocDrawer";
import { EpubWordPopover } from "@/components/epub/EpubWordPopover";
import { useEpubReaderState } from "@/hooks/useEpubReaderState";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubReaderPageProps {
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onRequireAuth: () => void;
}

export const EpubReaderPage: React.FC<EpubReaderPageProps> = ({
  userId,
  statusMap,
  onSetWordStatus,
  onRequireAuth,
}) => {
  const state = useEpubReaderState(userId);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleWordStatus = (canonicalId: string, status: UserVocabStatus | null) => {
    if (!userId) {
      onRequireAuth();
      return;
    }
    onSetWordStatus(canonicalId, status);
  };

  if (!state.activeBook) {
    return (
      <EpubBookshelf
        books={state.shelf}
        progressMap={state.progressMap}
        importing={state.importing}
        error={state.error}
        onImportFile={state.importFile}
        onOpenBook={state.openBook}
        onDeleteBook={state.removeBook}
      />
    );
  }

  const chapter = state.activeBook.chapters[state.chapterIndex] || state.activeBook.chapters[0];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 -mb-10 flex flex-col">
      <EpubReaderHeader
        title={state.activeBook.title}
        chapterTitle={chapter.title}
        chapterIndex={chapter.index}
        chapterCount={state.activeBook.chapters.length}
        parsing={state.parsing}
        autoParse={state.settings.autoParse !== false}
        theme={state.settings.theme}
        scrollMode={state.settings.scrollMode}
        onBack={() => { state.setActiveBook(null); void state.refreshShelf(); }}
        onParseNow={state.parseCurrentTarget}
        onToggleToc={() => setTocOpen(true)}
        onToggleScrollMode={() =>
          state.updateSettings({
            ...state.settings,
            scrollMode: state.settings.scrollMode === "scroll" ? "paged" : "scroll",
          })
        }
        onToggleSettings={() => setSettingsOpen(true)}
      />
      <EpubReaderViewport
        chapter={chapter}
        chapterCount={state.activeBook.chapters.length}
        parsedBlocks={state.parsedBlocks}
        settings={state.settings}
        statusMap={statusMap}
        selectedBlockIdx={state.selected?.blockIdx ?? null}
        selectedWordStart={state.selected?.ctx.token.start ?? null}
        onSelectWord={(blockIdx, ctx) => state.setSelected({ blockIdx, ctx })}
        onChangeChapter={(idx) => { state.setChapterIndex(idx); window.scrollTo({ top: 0 }); }}
        onVisibleBlocksChange={state.setVisibleIndices}
      />
      <EpubWordPopover
        ctx={state.selected?.ctx ?? null}
        language={state.activeBook.language}
        bookTitle={state.activeBook.title}
        statusMap={statusMap}
        onSetWordStatus={handleWordStatus}
        onClose={() => state.setSelected(null)}
      />
      <EpubTocDrawer
        open={tocOpen}
        chapters={state.activeBook.chapters}
        activeIndex={state.chapterIndex}
        onSelectChapter={state.setChapterIndex}
        onClose={() => setTocOpen(false)}
      />
      <EpubSettingsDrawer
        open={settingsOpen}
        settings={state.settings}
        onChange={state.updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
