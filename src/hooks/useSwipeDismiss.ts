import { useEffect, useRef, useState } from "react";
import type React from "react";

export function useSwipeDismiss(
  active: boolean,
  onClose: () => void,
  sheetRef: React.RefObject<HTMLDivElement | null>,
  scrollRef: React.RefObject<HTMLDivElement | null>
) {
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
  const startRef = useRef<{ y: number; t: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    const prevHtml = document.documentElement.style.overscrollBehaviorY;
    const prevBody = document.body.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = "none";
    document.body.style.overscrollBehaviorY = "none";
    return () => {
      document.documentElement.style.overscrollBehaviorY = prevHtml;
      document.body.style.overscrollBehaviorY = prevBody;
    };
  }, [active]);

  useEffect(() => {
    const el = sheetRef.current;
    if (!active || !el) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if ((scrollRef.current?.scrollTop ?? 0) > 2) {
        startRef.current = null;
        return;
      }
      dragYRef.current = 0;
      startRef.current = { y: e.touches[0].clientY, t: Date.now() };
    };

    const onMove = (e: TouchEvent) => {
      if (!startRef.current || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - startRef.current.y;
      if (dy > 0) {
        e.preventDefault();
        dragYRef.current = dy;
        setDragY(dy);
      } else {
        dragYRef.current = 0;
        setDragY(0);
      }
    };

    const onEnd = () => {
      if (!startRef.current) return;
      const dy = dragYRef.current;
      const elapsed = Date.now() - startRef.current.t;
      const shouldClose = dy > 80 || (dy > 36 && elapsed < 220);
      startRef.current = null;
      dragYRef.current = 0;
      setDragY(0);
      if (shouldClose) onClose();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [active, onClose, sheetRef, scrollRef]);

  return { dragY };
}
