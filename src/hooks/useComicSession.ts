import { useCallback, useEffect, useState } from "react";
import { fetchComicPage } from "@/api/comicReader.api";
import type { ComicPageData, ComicReadingDirection, ComicToken, ElenoComicManifest } from "@/types/comicReader.types";
import type { SelectedTokenState } from "@/types/reader.types";

export function useComicSession(mediaItemId: string, manifest: ElenoComicManifest | null) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [pageData, setPageData] = useState<ComicPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [readingDirection, setReadingDirection] = useState<ComicReadingDirection>(
    manifest?.reading_direction || (manifest?.type === "manga" ? "rtl" : "ltr")
  );
  const [showBoxes, setShowBoxes] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<SelectedTokenState | null>(null);

  const totalPages = manifest?.pages.length || 0;

  useEffect(() => {
    if (!manifest || !mediaItemId) return;
    const pageMeta = manifest.pages.find((p) => p.index === currentPageIndex);
    if (!pageMeta) return;

    setLoading(true);
    setError(null);
    fetchComicPage(mediaItemId, pageMeta)
      .then((data) => {
        setPageData(data);
        setLoading(false);
        setZoom((prev) => {
          if (prev === 1 && data.width > 0) {
            const fit = Number(((window.innerWidth - 32) / data.width).toFixed(2));
            return Math.max(0.25, Math.min(2.0, fit));
          }
          return prev;
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load comic page");
        setLoading(false);
      });
  }, [mediaItemId, manifest, currentPageIndex]);

  const selectToken = useCallback(
    (token: ComicToken, paraIdx: number, tokIdx: number) => {
      if (!token.canonical_id) return;
      setSelectedToken({
        surface: token.surface,
        entry: {
          id: token.canonical_id,
          tracked: true,
          lemma: token.lemma,
          pos: token.pos,
          cefr: token.cefr || "unranked",
          rank: token.rank,
          definitions: token.definition ? [token.definition] : [],
        },
        blockIndex: currentPageIndex,
        sentenceIndex: paraIdx,
        tokenIndex: tokIdx,
        phrases: [],
        sentenceText: pageData?.paragraphs[paraIdx]?.text,
      });
    },
    [currentPageIndex, pageData]
  );

  const closeDock = useCallback(() => setSelectedToken(null), []);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(3, Number((z * 1.15).toFixed(2)))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.3, Number((z / 1.15).toFixed(2)))), []);
  const fitWidth = useCallback(() => {
    if (!pageData) return;
    const availableWidth = window.innerWidth - 32;
    setZoom(Number((availableWidth / pageData.width).toFixed(2)));
  }, [pageData]);

  const nextPage = useCallback(
    () => setCurrentPageIndex((p) => Math.min(totalPages, p + 1)),
    [totalPages]
  );
  const prevPage = useCallback(() => setCurrentPageIndex((p) => Math.max(1, p - 1)), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        readingDirection === "rtl" ? prevPage() : nextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        readingDirection === "rtl" ? nextPage() : prevPage();
      } else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "Escape") closeDock();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingDirection, nextPage, prevPage, zoomIn, zoomOut, closeDock]);

  return {
    currentPageIndex,
    setCurrentPageIndex,
    pageData,
    loading,
    error,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    fitWidth,
    readingDirection,
    toggleReadingDirection: () => setReadingDirection((d) => (d === "ltr" ? "rtl" : "ltr")),
    showBoxes,
    toggleBoxes: () => setShowBoxes((b) => !b),
    selectedToken,
    selectToken,
    closeDock,
    nextPage,
    prevPage,
    totalPages,
  };
}
