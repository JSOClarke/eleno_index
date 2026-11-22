import { useRef, useState } from "react";
import type React from "react";

export function useSwipeDismiss(
  onClose: () => void,
  scrollRef: React.RefObject<HTMLDivElement | null>
) {
  const [dragY, setDragY] = useState(0);
  const startRef = useRef<{ y: number; t: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if ((scrollRef.current?.scrollTop ?? 0) > 2) {
      startRef.current = null;
      return;
    }
    startRef.current = { y: e.touches[0].clientY, t: Date.now() };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!startRef.current || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - startRef.current.y;
    if (dy > 0) setDragY(dy);
    else setDragY(0);
  };

  const onTouchEnd = () => {
    if (!startRef.current) return;
    const elapsed = Date.now() - startRef.current.t;
    const shouldClose = dragY > 80 || (dragY > 36 && elapsed < 220);
    startRef.current = null;
    setDragY(0);
    if (shouldClose) onClose();
  };

  return { dragY, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd };
}
