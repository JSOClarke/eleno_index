import { useEffect, useState } from "react";
import { bookFractionFromChapter } from "@/lib/readerProgress";
import type { ElenoReaderChapter, ElenoReaderManifest } from "@/types/reader.types";

export interface ReaderPosition {
  chapterFraction: number;
  bookFraction: number;
  blockIndex: number;
}

const INITIAL_POSITION: ReaderPosition = {
  chapterFraction: 0,
  bookFraction: 0,
  blockIndex: 0,
};

/** Continuously maps the reader viewport to both book and chapter position. */
export function useReaderPosition(
  manifest: ElenoReaderManifest,
  chapterIndex: number,
  chapter: ElenoReaderChapter | null,
  enabled: boolean
): ReaderPosition {
  const [position, setPosition] = useState<ReaderPosition>(INITIAL_POSITION);

  useEffect(() => {
    setPosition(INITIAL_POSITION);
    if (!enabled || !chapter) return;

    let frame: number | null = null;

    const measure = () => {
      const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-block]"));
      if (blocks.length === 0) return;

      const anchor = window.scrollY + window.innerHeight * 0.32;
      let top = Number.POSITIVE_INFINITY;
      let bottom = Number.NEGATIVE_INFINITY;
      let blockIndex = 0;

      for (const block of blocks) {
        const rect = block.getBoundingClientRect();
        const blockTop = rect.top + window.scrollY;
        const blockBottom = blockTop + rect.height;
        top = Math.min(top, blockTop);
        bottom = Math.max(bottom, blockBottom);

        const index = Number(block.dataset.block);
        if (!Number.isNaN(index) && blockTop <= anchor) {
          blockIndex = Math.max(blockIndex, index);
        }
      }

      const fraction = Math.max(0, Math.min(1, (anchor - top) / Math.max(1, bottom - top)));
      const bookFraction = bookFractionFromChapter(manifest, chapterIndex, fraction);

      setPosition((previous) => {
        if (
          previous.blockIndex === blockIndex &&
          Math.abs(previous.chapterFraction - fraction) < 0.002 &&
          Math.abs(previous.bookFraction - bookFraction) < 0.001
        ) {
          return previous;
        }
        return { chapterFraction: fraction, bookFraction, blockIndex };
      });
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    const canvasArticle = document.getElementById("reader-canvas-article");
    if (canvasArticle) {
      observer?.observe(canvasArticle);
    } else {
      observer?.observe(document.body);
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [manifest, chapterIndex, chapter, enabled]);

  return position;
}
