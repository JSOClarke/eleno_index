import { useLayoutEffect, useState, type RefObject } from "react";

interface AnchorRect {
  top: number;
  left: number;
  bottom: number;
  width: number;
}

const MARGIN = 12;
const GAP = 8;

function computePosition(
  anchor: AnchorRect,
  popW: number,
  popH: number
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.max(MARGIN, Math.min(vw - popW - MARGIN, anchor.left));

  const belowTop = anchor.bottom + GAP;
  const aboveTop = anchor.top - popH - GAP;

  let top: number;
  if (belowTop + popH <= vh - MARGIN) {
    top = belowTop;
  } else if (aboveTop >= MARGIN) {
    top = aboveTop;
  } else {
    top = Math.max(MARGIN, vh - popH - MARGIN);
  }
  return { top, left };
}

/** Measures rendered popover dimensions via ResizeObserver so it never clips outside the viewport. */
export function usePopoverPosition(
  anchor: AnchorRect | null | undefined,
  sheetRef: RefObject<HTMLDivElement | null>,
  fallbackW: number,
  fallbackH: number
): { top: number; left: number } {
  const [pos, setPos] = useState<{ top: number; left: number }>(() =>
    anchor ? computePosition(anchor, fallbackW, fallbackH) : { top: MARGIN, left: MARGIN }
  );

  useLayoutEffect(() => {
    if (!anchor) return;
    const el = sheetRef.current;
    const update = () => {
      const w = el ? el.offsetWidth || fallbackW : fallbackW;
      const h = el ? el.offsetHeight || fallbackH : fallbackH;
      const next = computePosition(anchor, w, h);
      setPos((prev) => (prev.top === next.top && prev.left === next.left ? prev : next));
    };
    update();
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [anchor, sheetRef, fallbackW, fallbackH]);

  return pos;
}
