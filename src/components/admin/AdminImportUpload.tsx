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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="text-xs font-semibold text-slate-900">
        1. Stage media file
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Supports books (<span className="font-mono">.epub</span>) and movies or TV episodes (<span className="font-mono">.srt</span>, <span className="font-mono">.vtt</span>). Nothing writes to the catalogue until committed.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".epub,.srt,.vtt,application/epub+zip,text/vtt,application/x-subrip"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setName(file.name);
            onUpload(file);
          }
        }}
      />
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {uploading ? "Inspecting..." : "Choose file (.epub, .srt, .vtt)"}
        </button>
        <span className="truncate text-xs text-slate-500">{name || "No file selected"}</span>
      </div>
    </div>
  );
};
