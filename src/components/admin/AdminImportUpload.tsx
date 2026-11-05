import React, { useRef, useState } from "react";

interface AdminImportUploadProps {
  uploading: boolean;
  onUpload: (file: File) => void;
}

export const AdminImportUpload: React.FC<AdminImportUploadProps> = ({
  uploading,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");

  return (
    <div className="border border-[#111111] bg-[#F8F8F6] p-4">
      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        1 / Stage EPUB
      </div>
      <p className="mt-1 text-xs text-[#555555]">
        The file is inspected without writing to the catalogue. Audit the metadata before committing.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".epub,application/epub+zip"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setName(file.name);
            onUpload(file);
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="border border-[#111111] bg-[#B8FF01] px-3 py-1.5 font-mono text-xs font-bold disabled:opacity-50 cursor-pointer"
        >
          {uploading ? "Inspecting..." : "Choose EPUB"}
        </button>
        <span className="truncate font-mono text-[11px] text-[#666666]">{name || "No file selected"}</span>
      </div>
    </div>
  );
};
