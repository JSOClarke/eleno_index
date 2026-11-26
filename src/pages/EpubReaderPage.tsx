import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EpubActionWheel } from "@/components/epub/EpubActionWheel";
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
  const { bookId } = useParams<{ bookId?: string }>();
  const navigate = useNavigate();
  const state = useEpubReaderState(userId);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wheel, setWheel] = useState<{ ctx: import("@/types/epubReader.types").SelectedWordContext; x: number; y: number } | null>(null);

  useEffect(() => {
    if (bookId && state.activeBook?.id !== bookId) {
      void state.openBook(bookId);
    } else if (!bookId && state.activeBook) {
      state.setActiveBook(null);
    }
  }, [bookId, userId]);

  const handleWordStatus = (canonicalId: string, status: UserVocabStatus | null) => {
    if (!userId) {
      onRequireAuth();
      return;
    }
    onSetWordStatus(canonicalId, status);
  };

  if (bookId && state.activeBook?.id !== bookId) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading book…</div>;
  }

  if (!state.activeBook) {
    return (
      <EpubBookshelf
        books={state.shelf}
        progressMap={state.progressMap}
        importing={state.importing}
        error={state.error}
        onImportFile={async (file) => { const b = await state.importFile(file); if (b) navigate(`/epub/${b.id}`); }}
        onOpenBook={(id) => { void state.openBook(id); navigate(`/epub/${id}`); }}
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
        onBack={() => { state.setActiveBook(null); navigate("/epub"); void state.refreshShelf(); }}
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
        initialPageIndex={state.initialPosition.pageIndex}
        initialScrollTop={state.initialPosition.scrollTop}
        initialBlockIndex={state.initialPosition.blockIndex}
        onSelectWord={(blockIdx, ctx) => { setWheel(null); state.setSelected({ blockIdx, ctx }); }}
        onOpenWheel={(ctx, pt) => { state.setSelected(null); setWheel({ ctx, x: pt.x, y: pt.y }); }}
        onChangeChapter={(idx) => { state.selectChapter(idx); window.scrollTo({ top: 0 }); }}
        onProgressChange={state.updateReadingPosition}
        onVisibleBlocksChange={state.setVisibleIndices}
      />
      <EpubActionWheel
        wheel={wheel}
        language={state.activeBook.language}
        statusMap={statusMap}
        onSetWordStatus={handleWordStatus}
        onInspect={(ctx) => state.setSelected({ blockIdx: 0, ctx })}
        onClose={() => setWheel(null)}
      />
      <EpubWordPopover
        ctx={state.selected?.ctx ?? null}
        userId={userId}
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
        onSelectChapter={state.selectChapter}
        onClose={() => setTocOpen(false)}
      />
      <EpubSettingsDrawer
        open={settingsOpen}
        settings={state.settings}
        language={state.activeBook.language}
        onChange={state.updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
