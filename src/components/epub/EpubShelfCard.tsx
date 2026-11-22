import React from "react";
import { BookOpen, Trash2 } from "lucide-react";
import type { EpubBookMeta, EpubProgress } from "@/types/epubReader.types";

interface EpubShelfCardProps {
  book: EpubBookMeta;
  progress?: EpubProgress;
  onOpen: (bookId: string) => void;
  onDelete: (bookId: string) => void;
}

export const EpubShelfCard: React.FC<EpubShelfCardProps> = ({
  book,
  progress,
  onOpen,
  onDelete,
}) => {
  const chNum = (progress?.chapterIndex ?? 0) + 1;
  const pct = Math.min(100, Math.round((chNum / Math.max(1, book.chapterCount)) * 100));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md">
      <button type="button" onClick={() => onOpen(book.id)} className="flex flex-1 flex-col text-left cursor-pointer">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full flex-col justify-between p-4 text-white">
              <BookOpen className="h-5 w-5 text-white/50" />
              <div>
                <div className="font-serif text-base font-medium line-clamp-3">{book.title}</div>
                <div className="mt-1 text-[11px] text-white/65 truncate">{book.author}</div>
              </div>
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-800 backdrop-blur-sm">
            {book.language}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3 space-y-2">
          <div>
            <h3 className="truncate text-sm font-semibold text-slate-900">{book.title}</h3>
            <p className="truncate text-xs text-slate-400">{book.author}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Ch {chNum}/{book.chapterCount}</span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        aria-label={`Remove ${book.title}`}
        onClick={() => onDelete(book.id)}
        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-500 opacity-0 shadow-xs transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
