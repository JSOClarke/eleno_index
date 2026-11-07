import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ReaderBottomBar } from "@/components/reader/ReaderBottomBar";
import { ReaderCanvas } from "@/components/reader/ReaderCanvas";
import { ReaderTopBar } from "@/components/reader/ReaderTopBar";
import { ReaderWordDock } from "@/components/reader/ReaderWordDock";
import { ReaderWordSheet } from "@/components/reader/ReaderWordSheet";
import { ReadingPositionRail } from "@/components/reader/ReadingPositionRail";
import { useReaderScroll } from "@/hooks/useReaderScroll";
import { useReaderSession } from "@/hooks/useReaderSession";
import type { ElenoReaderManifest } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface BookReaderViewProps {
  mediaId: string;
  manifest: ElenoReaderManifest;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  mediaId,
  manifest,
  statusMap,
  onSetWordStatus,
}) => {
  const navigate = useNavigate();
  const session = useReaderSession(mediaId, manifest);

  useReaderScroll({
    chapter: session.chapter,
    currentBlockIndex: session.currentBlockIndex,
    recordPosition: session.recordPosition,
  });

  const curCh = manifest.chapters.find((c) => c.index === session.chapterIndex);
  const total = manifest.total_chapters || manifest.chapters.length || 1;

  const handleToggleKnown = useCallback(
    (id: string, st?: UserVocabStatus) => onSetWordStatus(id, st === "known" ? null : "known"),
    [onSetWordStatus]
  );

  const dockProps = {
    selectedToken: session.selectedToken,
    status: session.selectedToken ? statusMap[session.selectedToken.entry.id] : undefined,
    onSetStatus: onSetWordStatus,
    onClose: session.closeDock,
    definitionLanguage: session.definitionLanguage,
    onDefinitionLanguageChange: session.setDefinitionLanguage,
  };

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-clip bg-white font-sans text-[#111111]">
      <ReaderTopBar
        title={manifest.title}
        chapters={manifest.chapters}
        currentChapterIndex={session.chapterIndex}
        onSelectChapter={session.setChapterIndex}
        showRuby={session.showRuby}
        rubyPos={session.rubyPos}
        onChangeRubyPos={session.setRubyPos}
        onToggleRuby={() => session.setShowRuby((p) => !p)}
        showIPlusOne={session.showIPlusOne}
        onToggleIPlusOne={() => session.setShowIPlusOne((p) => !p)}
        highlightMode={session.highlightMode}
        onChangeHighlightMode={session.setHighlightMode}
        highlightUnknownOnly={session.highlightUnknownOnly}
        onToggleHighlightUnknownOnly={() => session.setHighlightUnknownOnly((p) => !p)}
        onBack={() => navigate(`/media/${mediaId}`)}
        fontSize={session.fontSize}
        onAdjustFontSize={session.adjustFontSize}
        progressSync={session.progressSync}
      />

      <ReadingPositionRail
        manifest={manifest}
        chapterIndex={session.chapterIndex}
        chapter={session.chapter}
        savedPercentage={session.savedPercentage}
        onSelectChapter={session.setChapterIndex}
      />

      <main onClick={session.closeDock} className="w-full min-w-0 flex-1 pb-24 pt-4">
        {session.loading ? (
          <div className="mx-auto max-w-2xl px-6 py-20 text-center font-mono text-xs text-[#666666] animate-pulse">
            Loading chapter {session.chapterIndex}...
          </div>
        ) : session.error ? (
          <div className="mx-auto max-w-2xl px-6 py-12 text-center text-red-600 font-mono text-sm">
            {session.error}
          </div>
        ) : session.chapter ? (
          <ReaderCanvas
            blocks={session.chapter.blocks}
            lexicon={manifest.lexicon}
            statusMap={statusMap}
            chapterTitle={curCh?.title || `Chapter ${session.chapterIndex}`}
            chapterIndex={session.chapterIndex}
            creator={manifest.creator || ""}
            fontSize={session.fontSize}
            showRuby={session.showRuby}
            rubyPos={session.rubyPos}
            showIPlusOne={session.showIPlusOne}
            highlightMode={session.highlightMode}
            highlightUnknownOnly={session.highlightUnknownOnly}
            onSelectToken={session.selectToken}
            onToggleKnown={handleToggleKnown}
          />
        ) : null}
      </main>

      <ReaderWordDock {...dockProps} />
      <ReaderWordSheet {...dockProps} />

      <ReaderBottomBar
        chapterIndex={session.chapterIndex}
        totalChapters={total}
        onPrev={() => session.setChapterIndex((p) => Math.max(1, p - 1))}
        onNext={() => session.setChapterIndex((p) => p + 1)}
      />
    </div>
  );
};
