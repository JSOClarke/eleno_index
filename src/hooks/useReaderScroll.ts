import { useEffect } from "react";
import type { ElenoReaderChapter } from "@/types/reader.types";

interface UseReaderScrollProps {
  chapter: ElenoReaderChapter | null;
  currentBlockIndex: number;
  recordPosition: (blockIdx: number, tokenIdx?: number) => void;
}

export function useReaderScroll({
  chapter,
  currentBlockIndex,
  recordPosition,
}: UseReaderScrollProps) {
  useEffect(() => {
    if (chapter && currentBlockIndex > 0) {
      const el = document.querySelector(`[data-block="${currentBlockIndex}"]`);
      if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [chapter?.chapter_index]);

  useEffect(() => {
    if (!chapter) return;
    const visible = new Map<number, Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const bIdx = Number(entry.target.getAttribute("data-block"));
          if (Number.isNaN(bIdx)) continue;
          if (entry.isIntersecting) visible.set(bIdx, entry.target);
          else visible.delete(bIdx);
        }

        let primary: number | null = null;
        let top = Number.POSITIVE_INFINITY;
        for (const [bIdx, element] of visible) {
          const elementTop = element.getBoundingClientRect().top;
          if (elementTop < top) {
            top = elementTop;
            primary = bIdx;
          }
        }
        if (primary !== null) recordPosition(primary);
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll("[data-block]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter, recordPosition]);
}
