import React from "react";
import { X } from "lucide-react";
import type { EpubChapter } from "@/types/epubReader.types";

interface EpubTocDrawerProps {
  open: boolean;
  chapters: EpubChapter[];
  activeIndex: number;
  onSelectChapter: (index: number) => void;
  onClose: () => void;
}

export const EpubTocDrawer: React.FC<EpubTocDrawerProps> = ({
  open,
  chapters,
  activeIndex,
  onSelectChapter,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-start bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="w-80 max-w-[85vw] bg-white p-4 shadow-2xl border-r border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Chapters ({chapters.length})</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex-1 overflow-y-auto space-y-1">
          {chapters.map((ch) => {
            const active = ch.index === activeIndex;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  onSelectChapter(ch.index);
                  onClose();
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                  active
                    ? "bg-slate-900 font-semibold text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="mr-2 opacity-60">{ch.index + 1}.</span>
                <span className="line-clamp-1">{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
