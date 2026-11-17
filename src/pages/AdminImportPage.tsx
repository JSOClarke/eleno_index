import React, { useState } from "react";
import { AdminBatchImportView } from "@/components/admin/AdminBatchImportView";
import { AdminSingleImportView } from "@/components/admin/AdminSingleImportView";

export const AdminImportPage: React.FC = () => {
  const [mode, setMode] = useState<"single" | "batch">("single");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">Import Workbench</h1>
          <p className="mt-1 text-xs text-slate-500">
            Stage EPUB books, movie subtitles (.srt/.vtt), or TV seasons — audit metadata before committing.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`rounded-full px-3.5 py-1.5 font-medium transition cursor-pointer ${
              mode === "single"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Single Media Audit
          </button>
          <button
            type="button"
            onClick={() => setMode("batch")}
            className={`rounded-full px-3.5 py-1.5 font-medium transition cursor-pointer ${
              mode === "batch"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Batch Library Import
          </button>
        </div>
      </div>

      {mode === "single" ? <AdminSingleImportView /> : <AdminBatchImportView />}
    </div>
  );
};
