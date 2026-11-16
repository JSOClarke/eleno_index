import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollFadeXProps {
  children: React.ReactNode;
  className?: string;
  /** Tailwind `from-*` colour matching the surface behind the scroller. */
  fadeFromClassName?: string;
  /** Show edge arrow buttons when content can scroll in that direction. */
  arrows?: boolean;
  arrowClassName?: string;
}

/**
 * Horizontal scroller that fades its edges only while content overflows in that
 * direction, so users can tell there is more to swipe to.
 */
export const ScrollFadeX: React.FC<ScrollFadeXProps> = ({
  children,
  className = "",
  fadeFromClassName = "from-white",
  arrows = false,
  arrowClassName = "bg-white/95",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 2);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update, children]);

  return (
    <div className={`relative ${className}`}>
      <div ref={scrollRef} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {showLeft && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${fadeFromClassName} to-transparent`}
        />
      )}
      {showRight && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${fadeFromClassName} to-transparent`}
        />
      )}
      {arrows && showLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className={`absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 text-slate-600 shadow-md backdrop-blur-xs transition hover:border-slate-300 hover:text-slate-900 cursor-pointer ${arrowClassName}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {arrows && showRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className={`absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 text-slate-600 shadow-md backdrop-blur-xs transition hover:border-slate-300 hover:text-slate-900 cursor-pointer ${arrowClassName}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
