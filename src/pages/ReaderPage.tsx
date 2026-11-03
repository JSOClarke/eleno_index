import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchReaderManifest } from "@/api/reader.api";
import { ReaderBottomBar } from "@/components/reader/ReaderBottomBar";
import { ReaderCanvas } from "@/components/reader/ReaderCanvas";
import { ReaderTopBar } from "@/components/reader/ReaderTopBar";
import { ReaderWordDock } from "@/components/reader/ReaderWordDock";
import { useReaderScroll } from "@/hooks/useReaderScroll";
import { useReaderSession } from "@/hooks/useReaderSession";
import type { ElenoReaderManifest } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReaderPageProps {
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({ statusMap, onSetWordStatus }) => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const navigate = useNavigate();
  const [manifest, setManifest] = useState<ElenoReaderManifest | null>(null);
  const [manifestErr, setManifestErr] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(20);

  useEffect(() => {
    if (!mediaId) return;
    fetchReaderManifest(mediaId)
      .then(setManifest)
      .catch((err) => setManifestErr(err.message || "Failed to load reader"));
  }, [mediaId]);

  const {
    chapterIndex,
    setChapterIndex,
    chapter,
    loading,
    error,
    showRuby,
    setShowRuby,
    showIPlusOne,
    setShowIPlusOne,
    highlightMode,
    setHighlightMode,
    highlightUnknownOnly,
    setHighlightUnknownOnly,
    selectedToken,
    selectToken,
    closeDock,
    currentBlockIndex,
    recordPosition,
    percentage,
  } = useReaderSession(mediaId || "", manifest);

  useReaderScroll({ chapter, currentBlockIndex, recordPosition });

  if (manifestErr) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white p-4 text-center">
        <h2 className="text-xl font-bold font-serif text-red-600">Failed to load reader</h2>
        <p className="mt-2 text-sm text-[#666666] font-mono">{manifestErr}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 border border-[#111111] px-4 py-2 text-xs font-mono font-bold shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const curCh = manifest?.chapters.find((c) => c.index === chapterIndex);
  const total = manifest?.total_chapters || manifest?.chapters.length || 1;

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans">
      {manifest && (
        <ReaderTopBar
          title={manifest.title}
          chapters={manifest.chapters}
          currentChapterIndex={chapterIndex}
          onSelectChapter={setChapterIndex}
          percentage={percentage}
          showRuby={showRuby}
          onToggleRuby={() => setShowRuby((p) => !p)}
          showIPlusOne={showIPlusOne}
          onToggleIPlusOne={() => setShowIPlusOne((p) => !p)}
          highlightMode={highlightMode}
          onChangeHighlightMode={setHighlightMode}
          highlightUnknownOnly={highlightUnknownOnly}
          onToggleHighlightUnknownOnly={() => setHighlightUnknownOnly((p) => !p)}
          onBack={() => navigate(`/media/${mediaId}`)}
          onAdjustFontSize={(d) => setFontSize((p) => Math.max(14, Math.min(32, p + d)))}
        />
      )}

      <main className="flex-1 pb-24 pt-4">
        {loading ? (
          <div className="mx-auto max-w-2xl px-6 py-20 text-center font-mono text-xs text-[#666666] animate-pulse">
            Loading chapter {chapterIndex}...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl px-6 py-12 text-center text-red-600 font-mono text-sm">{error}</div>
        ) : chapter && manifest ? (
          <ReaderCanvas
            blocks={chapter.blocks}
            lexicon={manifest.lexicon}
            statusMap={statusMap}
            chapterTitle={curCh?.title || `Chapter ${chapterIndex}`}
            chapterIndex={chapterIndex}
            creator={manifest.creator || ""}
            fontSize={fontSize}
            showRuby={showRuby}
            showIPlusOne={showIPlusOne}
            highlightMode={highlightMode}
            highlightUnknownOnly={highlightUnknownOnly}
            selectedTokenId={selectedToken?.entry.id || null}
            onSelectToken={selectToken}
          />
        ) : null}
      </main>

      <ReaderWordDock
        selectedToken={selectedToken}
        status={selectedToken ? statusMap[selectedToken.entry.id] : undefined}
        onSetStatus={onSetWordStatus}
        onClose={closeDock}
      />

      <ReaderBottomBar
        chapterIndex={chapterIndex}
        totalChapters={total}
        percentage={percentage}
        onPrev={() => setChapterIndex((p) => Math.max(1, p - 1))}
        onNext={() => setChapterIndex((p) => p + 1)}
      />
    </div>
  );
};
export default ReaderPage;
