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
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [chapter?.chapter_index]);

  useEffect(() => {
    if (!chapter) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const bIdx = Number(entry.target.getAttribute("data-block"));
            if (!isNaN(bIdx)) recordPosition(bIdx);
          }
        }
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll("[data-block]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter, recordPosition]);
}
