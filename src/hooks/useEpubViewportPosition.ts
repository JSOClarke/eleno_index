import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

interface UseViewportPositionArgs {
  pagedRef: RefObject<HTMLDivElement | null>;
  chapterIndex: number;
  chapterCount: number;
  scrollMode: "scroll" | "paged";
  fontSize: number;
  parsedKey: number;
  initialPageIndex: number;
  initialScrollTop: number;
  initialBlockIndex: number;
  onChangeChapter: (nextIndex: number) => void;
  onProgressChange?: (pos: { pageIndex: number; scrollTop: number; blockIndex?: number }) => void;
  onVisibleBlocksChange?: (indices: number[]) => void;
}

function getVisibleBlocksPaged(el: HTMLDivElement): number[] {
  const rect = el.getBoundingClientRect();
  const visible: number[] = [];
  el.querySelectorAll<HTMLElement>("[data-block-idx]").forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.right > rect.left + 4 && r.left < rect.right - 4) {
      const idx = Number(node.dataset.blockIdx);
      if (Number.isFinite(idx)) visible.push(idx);
    }
  });
  return visible;
}

function getFirstVisibleBlockScroll(): number {
  const nodes = document.querySelectorAll<HTMLElement>("[data-block-idx]");
  for (const node of nodes) {
    if (node.getBoundingClientRect().bottom > 110) return Number(node.dataset.blockIdx) || 0;
  }
  return 0;
}

export function useEpubViewportPosition({
  pagedRef, chapterIndex, chapterCount, scrollMode, fontSize, parsedKey,
  initialPageIndex, initialScrollTop, initialBlockIndex, onChangeChapter, onProgressChange, onVisibleBlocksChange,
}: UseViewportPositionArgs) {
  const restoredKeyRef = useRef("");
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const reportVisibleBlocks = useCallback(() => {
    const el = pagedRef.current;
    if (!el || !onVisibleBlocksChange || scrollMode !== "paged") return;
    const visible = getVisibleBlocksPaged(el);
    if (visible.length > 0) onVisibleBlocksChange(visible);
  }, [pagedRef, onVisibleBlocksChange, scrollMode]);

  useEffect(() => {
    const key = `${chapterIndex}:${scrollMode}`;
    if (scrollMode === "scroll") {
      if (restoredKeyRef.current !== key) {
        restoredKeyRef.current = key;
        requestAnimationFrame(() => {
          const anchor = initialBlockIndex > 0 ? document.querySelector<HTMLElement>(`[data-block-idx="${initialBlockIndex}"]`) : null;
          const top = anchor ? Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 110) : initialScrollTop;
          window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
        });
      }
      let t: number | undefined;
      const onScroll = () => {
        window.clearTimeout(t);
        t = window.setTimeout(() => onProgressChange?.({ pageIndex: 0, scrollTop: Math.round(window.scrollY), blockIndex: getFirstVisibleBlockScroll() }), 300);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); };
    }
    if (!pagedRef.current) return;
    const el = pagedRef.current;
    const measure = () => {
      const total = Math.max(1, Math.round(el.scrollWidth / (el.clientWidth || 1)));
      setPageCount(total);
      if (restoredKeyRef.current !== key) {
        restoredKeyRef.current = key;
        let target = Math.max(0, Math.min(total - 1, initialPageIndex));
        if (initialBlockIndex > 0) {
          const anchor = el.querySelector<HTMLElement>(`[data-block-idx="${initialBlockIndex}"]`);
          if (anchor) {
            const relLeft = anchor.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
            target = Math.max(0, Math.min(total - 1, Math.floor((relLeft + 4) / (el.clientWidth || 1))));
          }
        }
        setPageIdx(target);
        el.scrollTo({ left: target * el.clientWidth, behavior: "instant" as ScrollBehavior });
      }
      reportVisibleBlocks();
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", measure); };
  }, [pagedRef, scrollMode, fontSize, chapterIndex, parsedKey, initialPageIndex, initialScrollTop, initialBlockIndex, onProgressChange, reportVisibleBlocks]);

  const goPage = useCallback((delta: number) => {
    const el = pagedRef.current;
    if (!el) return;
    const next = pageIdx + delta;
    if (next < 0 && chapterIndex > 0) return onChangeChapter(chapterIndex - 1);
    if (next >= pageCount && chapterIndex < chapterCount - 1) return onChangeChapter(chapterIndex + 1);
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    setPageIdx(clamped);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(() => {
      const visible = getVisibleBlocksPaged(el);
      onProgressChange?.({ pageIndex: clamped, scrollTop: 0, blockIndex: visible[0] ?? 0 });
      if (visible.length > 0) onVisibleBlocksChange?.(visible);
    });
  }, [pagedRef, pageIdx, pageCount, chapterIndex, chapterCount, onChangeChapter, onProgressChange, onVisibleBlocksChange]);

  return { pageIdx, pageCount, goPage };
}
