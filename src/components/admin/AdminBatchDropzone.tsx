import React, { useRef, useState } from "react";

interface AdminBatchDropzoneProps {
  uploading: boolean;
  onUploadBatch: (files: File[]) => void;
}

export const AdminBatchDropzone: React.FC<AdminBatchDropzoneProps> = ({
  uploading,
  onUploadBatch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const valid = Array.from(fileList).filter((f) =>
      /\.(epub|srt|vtt)$/i.test(f.name)
    );
    if (valid.length > 0) {
      onUploadBatch(valid);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-7 transition-colors text-center ${
        isDragging
          ? "border-indigo-400 bg-indigo-50/50"
          : "border-slate-300 bg-white/80 hover:border-slate-400"
      }`}
    >
      <div className="text-xs font-semibold text-slate-500">
        Batch Library Intake
      </div>
      <p className="mt-1.5 font-serif text-base text-slate-900">
        Drag & drop EPUB books, movie subtitles, or full TV season episodes here.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Multi-episode subtitle files (e.g. S01E01–S01E08) auto-group into one season for review before committing.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".epub,.srt,.vtt,application/epub+zip,text/vtt,application/x-subrip"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mt-4 flex justify-center items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 cursor-pointer shadow-xs transition"
        >
          {uploading ? "Inspecting files..." : "Select media files"}
        </button>
      </div>
    </div>
  );
};
