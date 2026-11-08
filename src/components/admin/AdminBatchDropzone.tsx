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
    const epubs = Array.from(fileList).filter((f) =>
      f.name.toLowerCase().endsWith(".epub")
    );
    if (epubs.length > 0) {
      onUploadBatch(epubs);
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
      className={`border-2 border-dashed p-6 transition-colors text-center ${
        isDragging
          ? "border-[#B8FF01] bg-[#F4FFE0]"
          : "border-[#CCCCCC] bg-[#F8F8F6] hover:border-[#111111]"
      }`}
    >
      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        Batch Library Intake
      </div>
      <p className="mt-1 font-serif text-sm text-[#333333]">
        Drag & drop multiple EPUB files here to stage them all at once.
      </p>
      <p className="mt-1 font-mono text-[11px] text-[#777777]">
        Candidate metadata will be extracted for each book without committing to Supabase.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".epub,application/epub+zip"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mt-4 flex justify-center items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="border border-[#111111] bg-[#B8FF01] px-4 py-2 font-mono text-xs font-bold text-[#111111] disabled:opacity-50 cursor-pointer shadow-sm hover:translate-y-[-1px] transition-transform"
        >
          {uploading ? "Inspecting EPUBs..." : "Select EPUB Files"}
        </button>
      </div>
    </div>
  );
};
