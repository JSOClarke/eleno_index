import React from "react";
import { ReaderWordDock } from "@/components/reader/ReaderWordDock";
import { ReaderWordSheet } from "@/components/reader/ReaderWordSheet";
import { useComicSession } from "@/hooks/useComicSession";
import type { ElenoComicManifest } from "@/types/comicReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ComicBottomBar } from "./ComicBottomBar";
import { ComicPageCanvas } from "./ComicPageCanvas";
import { ComicTopBar } from "./ComicTopBar";

interface ComicReaderViewProps {
  mediaItemId: string;
  manifest: ElenoComicManifest;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onBack: () => void;
}

export const ComicReaderView: React.FC<ComicReaderViewProps> = ({
  mediaItemId,
  manifest,
  statusMap,
  onSetWordStatus,
  onBack,
}) => {
  const session = useComicSession(mediaItemId, manifest);

  const dockProps = {
    selectedToken: session.selectedToken,
    status: session.selectedToken ? statusMap[session.selectedToken.entry.id] : undefined,
    onSetStatus: onSetWordStatus,
    onClose: session.closeDock,
    definitionLanguage: "en" as const,
    onDefinitionLanguageChange: () => {},
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-[#141416] font-sans text-[#111111]">
      <ComicTopBar
        title={manifest.title}
        pages={manifest.pages}
        currentPageIndex={session.currentPageIndex}
        readingDirection={session.readingDirection}
        zoom={session.zoom}
        showBoxes={session.showBoxes}
        onSelectPage={session.setCurrentPageIndex}
        onToggleReadingDirection={session.toggleReadingDirection}
        onZoomIn={session.zoomIn}
        onZoomOut={session.zoomOut}
        onFitWidth={session.fitWidth}
        onToggleBoxes={session.toggleBoxes}
        onBack={onBack}
      />

      <main className="flex-1 pb-16 pt-2">
        {session.loading ? (
          <div className="flex h-[70vh] items-center justify-center font-mono text-xs text-neutral-400 animate-pulse">
            Loading page {session.currentPageIndex}...
          </div>
        ) : session.error ? (
          <div className="flex h-[70vh] items-center justify-center font-mono text-sm text-red-500">
            {session.error}
          </div>
        ) : session.pageData ? (
          <ComicPageCanvas
            pageData={session.pageData}
            zoom={session.zoom}
            statusMap={statusMap}
            selectedCanonicalId={session.selectedToken?.entry.id}
            showBoxes={session.showBoxes}
            onSelectToken={session.selectToken}
            onBackgroundClick={session.closeDock}
          />
        ) : null}
      </main>

      <ReaderWordDock {...dockProps} />
      <ReaderWordSheet {...dockProps} />

      <ComicBottomBar
        currentPageIndex={session.currentPageIndex}
        totalPages={session.totalPages}
        readingDirection={session.readingDirection}
        onPrev={session.prevPage}
        onNext={session.nextPage}
      />
    </div>
  );
};
