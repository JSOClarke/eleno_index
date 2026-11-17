import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "bottom" | "left";
  /** Rendered outside the scroll area, pinned to the bottom of the panel. */
  footer?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  title,
  children,
  className = "",
  side = "bottom",
  footer,
}) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isLeft = side === "left";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${isLeft ? "justify-start" : "flex-col justify-end"} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Panel"}
    >
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-200 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative flex flex-col bg-white transition-transform duration-200 ease-out ${
          isLeft
            ? `h-full w-80 max-w-[85vw] border-r border-slate-200 shadow-2xl ${
                entered ? "translate-x-0" : "-translate-x-full"
              }`
            : `max-h-[90dvh] w-full rounded-t-2xl shadow-2xl ${
                entered ? "translate-y-0" : "translate-y-full"
              }`
        }`}
      >
        {!isLeft && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-300" />}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5">
          <span className="text-sm font-semibold text-slate-900">
            {title || ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};
