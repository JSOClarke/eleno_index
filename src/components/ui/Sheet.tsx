import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile bottom sheet: backdrop, drag affordance, ESC/backdrop close and body
 * scroll lock. Callers control when it is mounted (typically `md:hidden`).
 */
export const Sheet: React.FC<SheetProps> = ({ open, onClose, title, children, className = "" }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Sheets can be marked `md:hidden` while still mounted on desktop. Locking
    // body scroll there removes the scrollbar and shifts the page horizontally.
    const root = rootRef.current;
    if (!root || window.getComputedStyle(root).display === "none") return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div ref={rootRef} className={`fixed inset-0 z-50 flex flex-col justify-end ${className}`} role="dialog" aria-modal="true" aria-label={title || "Panel"}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/40"
      />
      <div className="relative flex max-h-[90dvh] w-full flex-col bg-white">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[#CCCCCC]" />
        <div className="flex items-center justify-between border-b border-[#E2E2DF] px-4 py-2.5">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
            {title || ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-1 font-mono text-sm font-bold text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
