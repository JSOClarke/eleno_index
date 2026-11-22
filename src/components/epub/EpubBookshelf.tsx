import React, { useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { EpubShelfCard } from "./EpubShelfCard";
import type { EpubBookMeta, EpubProgress } from "@/types/epubReader.types";

interface EpubBookshelfProps {
  books: EpubBookMeta[];
  progressMap: Record<string, EpubProgress>;
  importing: boolean;
  error: string | null;
  onImportFile: (file: File) => void;
  onOpenBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
}

export const EpubBookshelf: React.FC<EpubBookshelfProps> = ({
  books, progressMap, importing, error, onImportFile, onOpenBook, onDeleteBook,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onImportFile(file);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Threshold EPUB Reader
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-slate-900">
            Read any EPUB with instant parsing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Books stay locally on your device. Tap any word for definitions, morphology, idioms, and Known/Learn sync.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{importing ? "Importing EPUB…" : "Add .epub"}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".epub,application/epub+zip"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition ${
          dragging ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
        }`}
      >
        <Upload className="h-7 w-7 text-slate-400" />
        <p className="mt-2.5 text-sm font-medium text-slate-800">
          Drop an <span className="font-mono text-xs">.epub</span> file here or tap to browse
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Works on phones and desktop without installing the browser extension.
        </p>
      </div>

      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {books.map((book) => (
            <EpubShelfCard
              key={book.id}
              book={book}
              progress={progressMap[book.id]}
              onOpen={onOpenBook}
              onDelete={onDeleteBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
